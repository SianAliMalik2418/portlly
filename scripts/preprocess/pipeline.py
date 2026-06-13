#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import re
import sys
import unicodedata
import urllib.request
import zipfile
from datetime import date, timedelta
from pathlib import Path
from typing import Iterable, Mapping, Sequence

try:
    import numpy as np
except ImportError:  # pragma: no cover - exercised by smoke runs in lean envs
    np = None


REPO_ROOT = Path(__file__).resolve().parents[2]
PREPROCESS_DIR = Path(__file__).resolve().parent

GLOVE_URL = "https://nlp.stanford.edu/data/glove.6B.zip"
GLOVE_ZIP_NAME = "glove.6B.zip"
GLOVE_TXT_NAME = "glove.6B.300d.txt"
GLOVE_ZIP_SHA256 = (
    "617afb2fe6cbd085c235baf7a465b96f4112bd7f7ccb2b2cbd649fed9cbcf2fb"
)
GLOVE_ZIP_BYTES = 862_182_613

WORDS_ALPHA_URL = (
    "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
)
WORDS_ALPHA_NAME = "words_alpha.txt"

DEFAULT_CACHE_DIR = REPO_ROOT / "data" / "preprocess" / "cache"
DEFAULT_WORK_DIR = REPO_ROOT / "data" / "preprocess"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "dist" / "puzzles"
DEFAULT_ANSWER_SEED = PREPROCESS_DIR / "answer_seed.txt"

DEFAULT_GUESS_LIMIT = 50_000
DEFAULT_CANDIDATE_COUNT = 400
DEFAULT_ANSWER_COUNT = 200
DEFAULT_RANK_BAND_SIZE = 5_000
DEFAULT_SCHEDULE_SEED = 20_260_612
DEFAULT_LAUNCH_DATE = "2026-06-07"

WORD_RE = re.compile(r"^[a-z]+$")

FUNCTION_AND_ABSTRACT_WORDS = {
    "a",
    "about",
    "above",
    "after",
    "again",
    "against",
    "all",
    "also",
    "am",
    "an",
    "and",
    "any",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "before",
    "being",
    "between",
    "both",
    "but",
    "by",
    "can",
    "could",
    "did",
    "do",
    "does",
    "doing",
    "down",
    "during",
    "each",
    "few",
    "for",
    "from",
    "further",
    "had",
    "has",
    "have",
    "having",
    "he",
    "her",
    "here",
    "hers",
    "herself",
    "him",
    "himself",
    "his",
    "how",
    "i",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "itself",
    "just",
    "me",
    "more",
    "most",
    "my",
    "myself",
    "no",
    "nor",
    "not",
    "now",
    "of",
    "off",
    "on",
    "once",
    "only",
    "or",
    "other",
    "our",
    "ours",
    "ourselves",
    "out",
    "over",
    "own",
    "same",
    "she",
    "should",
    "so",
    "some",
    "such",
    "than",
    "that",
    "the",
    "their",
    "theirs",
    "them",
    "themselves",
    "then",
    "there",
    "these",
    "they",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "until",
    "up",
    "very",
    "was",
    "we",
    "were",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "whom",
    "why",
    "will",
    "with",
    "you",
    "your",
    "yours",
    "yourself",
    "yourselves",
    "ability",
    "act",
    "action",
    "activity",
    "age",
    "area",
    "case",
    "cause",
    "change",
    "concept",
    "condition",
    "day",
    "effect",
    "event",
    "example",
    "fact",
    "form",
    "group",
    "idea",
    "issue",
    "kind",
    "life",
    "lot",
    "matter",
    "means",
    "member",
    "method",
    "moment",
    "month",
    "number",
    "part",
    "people",
    "person",
    "place",
    "point",
    "problem",
    "process",
    "question",
    "reason",
    "result",
    "right",
    "side",
    "state",
    "system",
    "thing",
    "time",
    "use",
    "way",
    "week",
    "work",
    "world",
    "year",
}

PROPER_NOUN_LIKE_WORDS = {
    "africa",
    "america",
    "april",
    "asia",
    "august",
    "australia",
    "china",
    "december",
    "england",
    "europe",
    "february",
    "france",
    "friday",
    "germany",
    "india",
    "january",
    "july",
    "june",
    "london",
    "march",
    "monday",
    "november",
    "october",
    "paris",
    "saturday",
    "september",
    "sunday",
    "thursday",
    "tuesday",
    "wednesday",
}

ANSWER_SUFFIX_BLOCKLIST = (
    "ability",
    "ally",
    "ance",
    "ence",
    "hood",
    "ible",
    "ically",
    "ism",
    "ist",
    "ity",
    "less",
    "ment",
    "ness",
    "ship",
    "tion",
    "tions",
)


class PipelineError(Exception):
    """Raised for expected preprocessing failures."""


def normalize_word(raw_word: str) -> str:
    word = raw_word.strip().lower()
    decomposed = unicodedata.normalize("NFKD", word)
    return "".join(char for char in decomposed if not unicodedata.combining(char))


def is_guess_word(word: str, min_length: int = 2, max_length: int = 15) -> bool:
    if not (min_length <= len(word) <= max_length):
        return False
    if not WORD_RE.fullmatch(word):
        return False
    if len(set(word)) == 1 and len(word) > 2:
        return False
    if word in PROPER_NOUN_LIKE_WORDS:
        return False
    return True


def is_answer_candidate(word: str) -> bool:
    if not is_guess_word(word, min_length=3, max_length=12):
        return False
    if word in FUNCTION_AND_ABSTRACT_WORDS:
        return False
    if word.endswith(ANSWER_SUFFIX_BLOCKLIST):
        return False
    return True


def hash_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def file_digest(path: Path, algorithm: str) -> str:
    digest = hashlib.new(algorithm)
    with path.open("rb") as input_file:
        for chunk in iter(lambda: input_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_file(
    path: Path,
    *,
    expected_sha256: str | None = None,
    expected_size: int | None = None,
) -> None:
    if expected_size is not None and path.stat().st_size != expected_size:
        raise PipelineError(
            f"{path} has size {path.stat().st_size}, expected {expected_size}"
        )
    if expected_sha256 is not None:
        actual_sha256 = file_digest(path, "sha256")
        if actual_sha256 != expected_sha256:
            raise PipelineError(
                f"{path} has sha256 {actual_sha256}, expected {expected_sha256}"
            )


def download_file(url: str, destination: Path, *, force: bool = False) -> None:
    if destination.exists() and not force:
        return

    destination.parent.mkdir(parents=True, exist_ok=True)
    staging_path = destination.with_suffix(f"{destination.suffix}.download")

    print(f"Downloading {url}")
    with urllib.request.urlopen(url) as response:
        with staging_path.open("wb") as output_file:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                output_file.write(chunk)

    staging_path.replace(destination)


def ensure_glove_vectors(args: argparse.Namespace) -> Path:
    glove_txt = args.glove_txt or (args.cache_dir / GLOVE_TXT_NAME)
    if glove_txt.exists():
        return glove_txt

    glove_zip = args.cache_dir / GLOVE_ZIP_NAME
    download_file(args.glove_url, glove_zip, force=args.force_download)
    verify_file(
        glove_zip,
        expected_sha256=args.glove_zip_sha256,
        expected_size=(
            GLOVE_ZIP_BYTES
            if args.glove_zip_sha256 == GLOVE_ZIP_SHA256
            else None
        ),
    )

    print(f"Extracting {GLOVE_TXT_NAME}")
    args.cache_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(glove_zip) as archive:
        archive.extract(GLOVE_TXT_NAME, args.cache_dir)

    if not glove_txt.exists():
        raise PipelineError(f"Expected extracted vector file at {glove_txt}")
    return glove_txt


def ensure_wordlist(args: argparse.Namespace) -> Path:
    wordlist_path = args.wordlist or (args.cache_dir / WORDS_ALPHA_NAME)
    if wordlist_path.exists():
        return wordlist_path

    download_file(args.wordlist_url, wordlist_path, force=args.force_download)
    return wordlist_path


def load_english_words(path: Path) -> set[str]:
    words: set[str] = set()
    with path.open("r", encoding="utf-8") as input_file:
        for line in input_file:
            word = normalize_word(line)
            if is_guess_word(word):
                words.add(word)
    return words


def iter_glove_words(path: Path) -> Iterable[str]:
    with path.open("r", encoding="utf-8") as input_file:
        for line in input_file:
            token = line.split(" ", 1)[0]
            yield normalize_word(token)


def unique_in_order(words: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for word in words:
        if word in seen:
            continue
        seen.add(word)
        result.append(word)
    return result


def read_word_file(path: Path) -> list[str]:
    words: list[str] = []
    with path.open("r", encoding="utf-8") as input_file:
        for line in input_file:
            word = normalize_word(line)
            if word:
                words.append(word)
    return unique_in_order(words)


def write_word_file(path: Path, words: Sequence[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(f"{word}\n" for word in words), encoding="utf-8")


def build_guess_set(
    glove_txt: Path,
    wordlist_path: Path,
    *,
    guess_limit: int,
) -> list[str]:
    english_words = load_english_words(wordlist_path)
    guess_words: list[str] = []
    seen: set[str] = set()

    for word in iter_glove_words(glove_txt):
        if word in seen or word not in english_words or not is_guess_word(word):
            continue
        seen.add(word)
        guess_words.append(word)
        if len(guess_words) >= guess_limit:
            break

    if not guess_words:
        raise PipelineError("No guess words were produced")
    return guess_words


def build_answer_candidates(
    guess_words: Sequence[str],
    *,
    candidate_count: int,
    answer_seed_path: Path | None,
) -> list[str]:
    guess_word_set = set(guess_words)
    seeded_candidates: list[str] = []

    if answer_seed_path is not None and answer_seed_path.exists():
        for word in read_word_file(answer_seed_path):
            if word in guess_word_set and is_answer_candidate(word):
                seeded_candidates.append(word)

    heuristic_candidates = [
        word for word in guess_words if is_answer_candidate(word)
    ]
    candidates = unique_in_order([*seeded_candidates, *heuristic_candidates])

    if len(candidates) < candidate_count:
        print(
            f"Warning: only {len(candidates)} answer candidates passed filters; "
            f"requested {candidate_count}"
        )
    return candidates[:candidate_count]


def build_wordlists(args: argparse.Namespace) -> tuple[Path, Path, Path]:
    glove_txt = ensure_glove_vectors(args)
    wordlist_path = ensure_wordlist(args)

    guess_set_path = args.work_dir / "guess_set.txt"
    answer_candidates_path = args.work_dir / "answer_candidates.txt"
    answer_set_path = args.work_dir / "answer_set.txt"

    if args.force_wordlists or not guess_set_path.exists():
        guess_words = build_guess_set(
            glove_txt,
            wordlist_path,
            guess_limit=args.guess_limit,
        )
        write_word_file(guess_set_path, guess_words)
        print(f"Wrote {len(guess_words)} guesses to {guess_set_path}")
    else:
        guess_words = read_word_file(guess_set_path)
        print(f"Using existing {guess_set_path} ({len(guess_words)} words)")

    if args.force_wordlists or not answer_candidates_path.exists():
        candidates = build_answer_candidates(
            guess_words,
            candidate_count=args.candidate_count,
            answer_seed_path=args.answer_seed,
        )
        write_word_file(answer_candidates_path, candidates)
        print(f"Wrote {len(candidates)} candidates to {answer_candidates_path}")
    else:
        candidates = read_word_file(answer_candidates_path)
        print(
            f"Using existing {answer_candidates_path} ({len(candidates)} words)"
        )

    if args.force_wordlists or not answer_set_path.exists():
        answer_words = candidates[: args.answer_count]
        if not answer_words:
            raise PipelineError("No answer words were produced")
        write_word_file(answer_set_path, answer_words)
        print(
            f"Wrote draft {answer_set_path} ({len(answer_words)} words). "
            "Review it manually before production generation."
        )
    else:
        answer_words = read_word_file(answer_set_path)
        print(f"Using existing {answer_set_path} ({len(answer_words)} words)")

    return guess_set_path, answer_candidates_path, answer_set_path


def parse_vector(values: str, *, use_numpy: bool):
    if use_numpy:
        assert np is not None
        return np.fromstring(values, sep=" ", dtype=np.float32)
    return tuple(float(value) for value in values.split())


def load_vectors(
    glove_txt: Path,
    target_words: set[str],
    *,
    use_numpy: bool,
) -> dict[str, object]:
    vectors: dict[str, object] = {}
    expected_dimensions: int | None = None

    with glove_txt.open("r", encoding="utf-8") as input_file:
        for line in input_file:
            token, _, values = line.rstrip().partition(" ")
            word = normalize_word(token)
            if word not in target_words or word in vectors:
                continue

            vector = parse_vector(values, use_numpy=use_numpy)
            dimensions = int(vector.shape[0]) if use_numpy else len(vector)
            if expected_dimensions is None:
                expected_dimensions = dimensions
            elif dimensions != expected_dimensions:
                raise PipelineError(
                    f"Inconsistent vector dimensions for {word}: {dimensions}"
                )

            vectors[word] = vector
            if len(vectors) == len(target_words):
                break

    missing_words = sorted(target_words.difference(vectors))
    if missing_words:
        preview = ", ".join(missing_words[:10])
        raise PipelineError(
            f"Missing {len(missing_words)} vectors from {glove_txt}: {preview}"
        )

    return vectors


def normalize_python_vector(vector: Sequence[float]) -> tuple[float, ...]:
    norm = math.sqrt(sum(value * value for value in vector))
    if norm == 0:
        raise PipelineError("Cannot normalize a zero vector")
    return tuple(value / norm for value in vector)


def score_from_cosine(cosine: float) -> float:
    return round(max(0.0, min(1.0, cosine)) * 100, 2)


def build_numpy_scoring_context(
    guess_words: Sequence[str],
    vectors: Mapping[str, object],
) -> tuple[object, dict[str, int]]:
    assert np is not None
    matrix = np.vstack([vectors[word] for word in guess_words]).astype(np.float32)
    norms = np.linalg.norm(matrix, axis=1)
    if np.any(norms == 0):
        raise PipelineError("Cannot normalize zero vectors")
    matrix = matrix / norms[:, None]
    word_indexes = {word: index for index, word in enumerate(guess_words)}
    return matrix, word_indexes


def cosine_scores_numpy(
    matrix: object,
    word_indexes: Mapping[str, int],
    answer_word: str,
) -> list[float]:
    assert np is not None

    answer_index = word_indexes[answer_word]
    cosines = matrix @ matrix[answer_index]
    return [score_from_cosine(float(cosine)) for cosine in cosines]


def build_python_scoring_context(
    guess_words: Sequence[str],
    vectors: Mapping[str, object],
) -> dict[str, tuple[float, ...]]:
    return {word: normalize_python_vector(vectors[word]) for word in guess_words}


def cosine_scores_python(
    guess_words: Sequence[str],
    normalized_vectors: Mapping[str, Sequence[float]],
    answer_word: str,
) -> list[float]:
    answer_vector = normalized_vectors[answer_word]
    scores: list[float] = []

    for word in guess_words:
        cosine = sum(
            value * answer_value
            for value, answer_value in zip(normalized_vectors[word], answer_vector)
        )
        scores.append(score_from_cosine(cosine))

    return scores


def build_ranked_scores(
    guess_words: Sequence[str],
    scores: Sequence[float],
) -> list[tuple[str, float, int]]:
    ranked_pairs = sorted(
        zip(guess_words, scores),
        key=lambda pair: (-pair[1], pair[0]),
    )
    return [
        (word, score, rank)
        for rank, (word, score) in enumerate(ranked_pairs, start=1)
    ]


def puzzle_filename(puzzle_id: str, answer_word: str) -> str:
    return f"{hash_text(f'{puzzle_id}:{answer_word}')[:32]}.json"


def generate_puzzle(
    *,
    puzzle_id: str,
    answer_word: str,
    guess_words: Sequence[str],
    rank_band_size: int,
    use_numpy: bool,
    numpy_matrix: object | None = None,
    word_indexes: Mapping[str, int] | None = None,
    normalized_vectors: Mapping[str, Sequence[float]] | None = None,
) -> tuple[str, dict[str, object]]:
    if answer_word not in guess_words:
        raise PipelineError(f"Answer word {answer_word!r} is not in guess_set.txt")

    if use_numpy:
        if numpy_matrix is None or word_indexes is None:
            raise PipelineError("Missing numpy scoring context")
        scores = cosine_scores_numpy(numpy_matrix, word_indexes, answer_word)
    else:
        if normalized_vectors is None:
            raise PipelineError("Missing pure-Python scoring context")
        scores = cosine_scores_python(guess_words, normalized_vectors, answer_word)

    ranked_scores = build_ranked_scores(guess_words, scores)
    score_by_word = {
        word: score
        for word, score in zip(guess_words, scores)
        if word != answer_word
    }
    rank_by_word = {
        word: rank
        for word, _score, rank in ranked_scores[:rank_band_size]
        if word != answer_word
    }

    puzzle = {
        "version": 1,
        "puzzleId": puzzle_id,
        "answerHash": hash_text(answer_word),
        "scoreScale": "max(0, cosine) * 100",
        "rankBandSize": rank_band_size,
        "scores": score_by_word,
        "ranks": rank_by_word,
    }
    return puzzle_filename(puzzle_id, answer_word), puzzle


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=True, separators=(",", ":"), sort_keys=True),
        encoding="utf-8",
    )


def build_daily_manifest(
    puzzle_records: Sequence[dict[str, str]],
    *,
    launch_date: str,
    schedule_seed: int,
) -> dict[str, object]:
    launch = date.fromisoformat(launch_date)
    shuffled_records = list(puzzle_records)
    random.Random(schedule_seed).shuffle(shuffled_records)

    return {
        "version": 1,
        "launchDate": launch.isoformat(),
        "scheduleSeed": schedule_seed,
        "dates": {
            (launch + timedelta(days=offset)).isoformat(): record["puzzleId"]
            for offset, record in enumerate(shuffled_records)
        },
    }


def assert_no_plaintext_answer(puzzle_path: Path, answer_word: str) -> None:
    puzzle_text = puzzle_path.read_text(encoding="utf-8")
    encoded_answer_key = json.dumps(answer_word)
    if encoded_answer_key in puzzle_text:
        raise PipelineError(
            f"{puzzle_path} leaks plaintext answer key {encoded_answer_key}"
        )


def generate_puzzles(args: argparse.Namespace) -> None:
    glove_txt = ensure_glove_vectors(args)
    guess_set_path = args.work_dir / "guess_set.txt"
    answer_set_path = args.work_dir / "answer_set.txt"

    if not guess_set_path.exists() or not answer_set_path.exists():
        raise PipelineError(
            "Missing wordlists. Run `pipeline.py build-wordlists` or `all` first."
        )

    guess_words = read_word_file(guess_set_path)
    answer_words = read_word_file(answer_set_path)
    target_words = set(guess_words).union(answer_words)

    use_numpy = not args.pure_python
    if use_numpy and np is None:
        if len(guess_words) > 1_000 or len(answer_words) > 25:
            raise PipelineError(
                "numpy is required for the full pipeline. Install "
                "`scripts/preprocess/requirements.txt` or pass `--pure-python` "
                "for tiny fixture runs."
            )
        print("numpy is unavailable; using pure-Python scoring for small run")
        use_numpy = False

    vectors = load_vectors(glove_txt, target_words, use_numpy=use_numpy)
    numpy_matrix = None
    word_indexes = None
    normalized_vectors = None

    if use_numpy:
        numpy_matrix, word_indexes = build_numpy_scoring_context(
            guess_words,
            vectors,
        )
    else:
        normalized_vectors = build_python_scoring_context(guess_words, vectors)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    puzzle_records: list[dict[str, str]] = []

    for index, answer_word in enumerate(answer_words, start=1):
        puzzle_id = f"word-{index:04d}"
        filename, puzzle = generate_puzzle(
            puzzle_id=puzzle_id,
            answer_word=answer_word,
            guess_words=guess_words,
            rank_band_size=args.rank_band_size,
            use_numpy=use_numpy,
            numpy_matrix=numpy_matrix,
            word_indexes=word_indexes,
            normalized_vectors=normalized_vectors,
        )
        puzzle_path = args.output_dir / filename
        write_json(puzzle_path, puzzle)
        assert_no_plaintext_answer(puzzle_path, answer_word)
        puzzle_records.append(
            {
                "puzzleId": puzzle_id,
                "fileName": filename,
                "answerHash": puzzle["answerHash"],
            }
        )

    puzzle_index = {
        "version": 1,
        "puzzles": puzzle_records,
    }
    daily_manifest = build_daily_manifest(
        puzzle_records,
        launch_date=args.launch_date,
        schedule_seed=args.schedule_seed,
    )

    write_json(args.output_dir / "puzzle_index.json", puzzle_index)
    write_json(args.output_dir / "daily_manifest.json", daily_manifest)

    print(f"Wrote {len(puzzle_records)} puzzle files to {args.output_dir}")
    print(f"Wrote {args.output_dir / 'puzzle_index.json'}")
    print(f"Wrote {args.output_dir / 'daily_manifest.json'}")


def run_smoke(args: argparse.Namespace) -> None:
    smoke_args = argparse.Namespace(**vars(args))
    smoke_args.cache_dir = DEFAULT_WORK_DIR / "smoke-cache"
    smoke_args.work_dir = DEFAULT_WORK_DIR / "smoke"
    smoke_args.output_dir = REPO_ROOT / "dist" / "puzzles-smoke"
    smoke_args.glove_txt = PREPROCESS_DIR / "fixtures" / "sample_vectors.txt"
    smoke_args.wordlist = PREPROCESS_DIR / "fixtures" / "sample_words.txt"
    smoke_args.guess_limit = 100
    smoke_args.candidate_count = 10
    smoke_args.answer_count = 7
    smoke_args.rank_band_size = 5
    smoke_args.pure_python = True
    smoke_args.force_wordlists = True

    build_wordlists(smoke_args)
    generate_puzzles(smoke_args)
    print("Smoke preprocessing completed")


def require_numpy_before_full_download(args: argparse.Namespace) -> None:
    if args.pure_python or np is not None:
        return
    if args.guess_limit <= 1_000 and args.answer_count <= 25:
        return
    raise PipelineError(
        "numpy is required before running the full pipeline. Run "
        "`scripts/preprocess/.venv/bin/python -m pip install -r "
        "scripts/preprocess/requirements.txt` first."
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Build word-game vocabularies and static puzzle files."
    )
    parser.add_argument(
        "command",
        choices=("download", "build-wordlists", "generate", "all", "smoke"),
        nargs="?",
        default="all",
    )
    parser.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE_DIR)
    parser.add_argument("--work-dir", type=Path, default=DEFAULT_WORK_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--glove-url", default=GLOVE_URL)
    parser.add_argument("--glove-zip-sha256", default=GLOVE_ZIP_SHA256)
    parser.add_argument("--glove-txt", type=Path)
    parser.add_argument("--wordlist-url", default=WORDS_ALPHA_URL)
    parser.add_argument("--wordlist", type=Path)
    parser.add_argument("--answer-seed", type=Path, default=DEFAULT_ANSWER_SEED)
    parser.add_argument("--guess-limit", type=int, default=DEFAULT_GUESS_LIMIT)
    parser.add_argument(
        "--candidate-count", type=int, default=DEFAULT_CANDIDATE_COUNT
    )
    parser.add_argument("--answer-count", type=int, default=DEFAULT_ANSWER_COUNT)
    parser.add_argument("--rank-band-size", type=int, default=DEFAULT_RANK_BAND_SIZE)
    parser.add_argument("--schedule-seed", type=int, default=DEFAULT_SCHEDULE_SEED)
    parser.add_argument("--launch-date", default=DEFAULT_LAUNCH_DATE)
    parser.add_argument("--force-download", action="store_true")
    parser.add_argument("--force-wordlists", action="store_true")
    parser.add_argument(
        "--pure-python",
        action="store_true",
        help="Disable numpy scoring. Intended only for tiny fixture runs.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        if args.command == "download":
            ensure_glove_vectors(args)
            ensure_wordlist(args)
        elif args.command == "build-wordlists":
            build_wordlists(args)
        elif args.command == "generate":
            generate_puzzles(args)
        elif args.command == "all":
            require_numpy_before_full_download(args)
            build_wordlists(args)
            generate_puzzles(args)
        elif args.command == "smoke":
            run_smoke(args)
        else:  # pragma: no cover - argparse prevents this branch
            raise PipelineError(f"Unknown command {args.command}")
    except PipelineError as error:
        print(f"preprocess error: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
