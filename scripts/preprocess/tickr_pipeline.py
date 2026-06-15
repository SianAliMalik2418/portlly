#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import html
import json
import random
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Sequence


REPO_ROOT = Path(__file__).resolve().parents[2]
PREPROCESS_DIR = Path(__file__).resolve().parent

DEFAULT_OUTPUT_DIR = REPO_ROOT / "dist" / "tickr"
DEFAULT_SMOKE_OUTPUT_DIR = REPO_ROOT / "dist" / "tickr-smoke"
DEFAULT_SMOKE_FIXTURE = PREPROCESS_DIR / "fixtures" / "tickr_smoke_questions.json"

OPENTDB_API_URL = "https://opentdb.com/api.php"
OPENTDB_TOKEN_URL = "https://opentdb.com/api_token.php"
OPENTDB_GENERAL_KNOWLEDGE_CATEGORY_ID = 9
TICKR_CATEGORY = "General Knowledge"
DIFFICULTIES = ("easy", "medium", "hard")
DEFAULT_AMOUNT = 50
DEFAULT_REQUEST_DELAY_SECONDS = 5.2
DEFAULT_MAX_QUESTION_CHARS = 170
DEFAULT_MAX_ANSWER_CHARS = 80
DEFAULT_TARGET_PER_DIFFICULTY = 500

QUESTION_SPACE_RE = re.compile(r"\s+")
LAST_OPENTDB_REQUEST_AT = 0.0


class TickrPreprocessError(Exception):
    pass


def decode_text(value: object) -> str:
    if not isinstance(value, str):
        return ""

    return QUESTION_SPACE_RE.sub(" ", html.unescape(value)).strip()


def stable_question_id(question: str, correct: str) -> str:
    digest = hashlib.sha256(f"{question}\0{correct}".encode("utf-8")).hexdigest()
    return f"tickr-{digest[:16]}"


def normalize_question_key(question: str) -> str:
    return question.casefold()


def shuffle_options(options: list[str], seed: str) -> list[str]:
    shuffled = list(options)
    random.Random(seed).shuffle(shuffled)
    return shuffled


def transform_question(
    raw: object,
    *,
    max_question_chars: int,
    max_answer_chars: int,
) -> dict[str, object] | None:
    if not isinstance(raw, dict):
        return None

    if raw.get("type") != "multiple":
        return None

    difficulty = decode_text(raw.get("difficulty")).lower()
    if difficulty not in DIFFICULTIES:
        return None

    category = decode_text(raw.get("category"))
    if category != TICKR_CATEGORY:
        return None

    question = decode_text(raw.get("question"))
    correct = decode_text(raw.get("correct_answer"))
    incorrect = [decode_text(answer) for answer in raw.get("incorrect_answers", [])]

    if (
        not question
        or not correct
        or len(incorrect) != 3
        or len(question) > max_question_chars
        or len(correct) > max_answer_chars
        or any(not answer or len(answer) > max_answer_chars for answer in incorrect)
    ):
        return None

    all_options = [correct, *incorrect]
    if len({option.casefold() for option in all_options}) != 4:
        return None

    question_id = stable_question_id(question, correct)

    return {
        "id": question_id,
        "question": question,
        "correct": correct,
        "options": shuffle_options(all_options, question_id),
        "category": TICKR_CATEGORY,
        "difficulty": difficulty,
    }


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=True, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def read_json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def write_buckets(
    questions: Sequence[object],
    *,
    output_dir: Path,
    max_question_chars: int,
    max_answer_chars: int,
) -> dict[str, int]:
    buckets: dict[str, list[dict[str, object]]] = {
        difficulty: [] for difficulty in DIFFICULTIES
    }
    seen_questions: set[str] = set()

    for raw_question in questions:
        question = transform_question(
            raw_question,
            max_question_chars=max_question_chars,
            max_answer_chars=max_answer_chars,
        )
        if question is None:
            continue

        question_key = normalize_question_key(str(question["question"]))
        if question_key in seen_questions:
            continue

        seen_questions.add(question_key)
        buckets[str(question["difficulty"])].append(question)

    for difficulty, bucket in buckets.items():
        bucket.sort(key=lambda item: str(item["id"]))
        write_json(output_dir / f"{difficulty}.json", bucket)

    manifest = {
        "version": 1,
        "gameId": "tickr",
        "source": "OpenTDB",
        "category": TICKR_CATEGORY,
        "categoryId": OPENTDB_GENERAL_KNOWLEDGE_CATEGORY_ID,
        "questionCount": sum(len(bucket) for bucket in buckets.values()),
        "buckets": {
            difficulty: {
                "fileName": f"{difficulty}.json",
                "count": len(bucket),
            }
            for difficulty, bucket in buckets.items()
        },
    }
    write_json(output_dir / "manifest.json", manifest)

    return {difficulty: len(bucket) for difficulty, bucket in buckets.items()}


def request_json(
    url: str, params: dict[str, object], *, request_delay: float = 0
) -> dict[str, object]:
    global LAST_OPENTDB_REQUEST_AT

    if request_delay > 0 and LAST_OPENTDB_REQUEST_AT > 0:
        elapsed = time.monotonic() - LAST_OPENTDB_REQUEST_AT
        wait_seconds = request_delay - elapsed
        if wait_seconds > 0:
            time.sleep(wait_seconds)

    encoded_params = urllib.parse.urlencode(params)
    request_url = f"{url}?{encoded_params}"
    request = urllib.request.Request(
        request_url,
        headers={
            "Accept": "application/json",
            "User-Agent": "portlly-tickr-preprocess/1.0",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as error:
        raise TickrPreprocessError(f"Request failed for {request_url}: {error}") from error
    finally:
        LAST_OPENTDB_REQUEST_AT = time.monotonic()

    if not isinstance(payload, dict):
        raise TickrPreprocessError(f"Unexpected response shape for {request_url}")

    return payload


def request_session_token(request_delay: float) -> str:
    payload = request_json(
        OPENTDB_TOKEN_URL,
        {"command": "request"},
        request_delay=request_delay,
    )
    token = payload.get("token")

    if payload.get("response_code") != 0 or not isinstance(token, str):
        raise TickrPreprocessError(f"Could not request OpenTDB token: {payload}")

    return token


def fetch_difficulty_questions(args: argparse.Namespace, difficulty: str) -> list[object]:
    token = request_session_token(args.request_delay)
    questions: list[object] = []
    seen_question_keys: set[str] = set()

    while len(questions) < args.target_per_difficulty:
        payload = request_json(
            OPENTDB_API_URL,
            {
                "amount": args.amount,
                "category": OPENTDB_GENERAL_KNOWLEDGE_CATEGORY_ID,
                "difficulty": difficulty,
                "type": "multiple",
                "token": token,
            },
            request_delay=args.request_delay,
        )
        response_code = payload.get("response_code")

        if response_code == 0:
            results = payload.get("results")
            if not isinstance(results, list):
                raise TickrPreprocessError("OpenTDB success response omitted results")

            accepted_this_page = 0
            for raw_question in results:
                transformed = transform_question(
                    raw_question,
                    max_question_chars=args.max_question_chars,
                    max_answer_chars=args.max_answer_chars,
                )
                if transformed is None:
                    continue

                question_key = normalize_question_key(str(transformed["question"]))
                if question_key in seen_question_keys:
                    continue

                seen_question_keys.add(question_key)
                questions.append(raw_question)
                accepted_this_page += 1

                if len(questions) >= args.target_per_difficulty:
                    break

            print(
                f"{difficulty}: accepted {accepted_this_page} "
                f"({len(questions)}/{args.target_per_difficulty})"
            )
        elif response_code in (1, 4):
            print(f"{difficulty}: OpenTDB exhausted with response code {response_code}")
            break
        elif response_code == 5:
            print(f"{difficulty}: rate limited; sleeping {args.request_delay}s")
        else:
            raise TickrPreprocessError(
                f"OpenTDB returned response code {response_code}: {payload}"
            )

    return questions


def run_harvest(args: argparse.Namespace) -> None:
    raw_questions: list[object] = []

    for difficulty in DIFFICULTIES:
        raw_questions.extend(fetch_difficulty_questions(args, difficulty))

    counts = write_buckets(
        raw_questions,
        output_dir=args.output_dir,
        max_question_chars=args.max_question_chars,
        max_answer_chars=args.max_answer_chars,
    )

    print(f"Wrote Tickr question buckets to {args.output_dir}")
    for difficulty in DIFFICULTIES:
        print(f"  {difficulty}: {counts[difficulty]}")


def run_smoke(args: argparse.Namespace) -> None:
    fixture = read_json(args.smoke_fixture)
    if not isinstance(fixture, list):
        raise TickrPreprocessError(f"{args.smoke_fixture} must contain a JSON array")

    counts = write_buckets(
        fixture,
        output_dir=args.output_dir,
        max_question_chars=args.max_question_chars,
        max_answer_chars=args.max_answer_chars,
    )

    print(f"Wrote Tickr smoke question buckets to {args.output_dir}")
    for difficulty in DIFFICULTIES:
        print(f"  {difficulty}: {counts[difficulty]}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Build Tickr static trivia question buckets."
    )
    parser.add_argument("command", choices=("all", "smoke"), nargs="?", default="all")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--smoke-fixture", type=Path, default=DEFAULT_SMOKE_FIXTURE)
    parser.add_argument("--amount", type=int, default=DEFAULT_AMOUNT)
    parser.add_argument(
        "--target-per-difficulty", type=int, default=DEFAULT_TARGET_PER_DIFFICULTY
    )
    parser.add_argument(
        "--request-delay", type=float, default=DEFAULT_REQUEST_DELAY_SECONDS
    )
    parser.add_argument(
        "--max-question-chars", type=int, default=DEFAULT_MAX_QUESTION_CHARS
    )
    parser.add_argument("--max-answer-chars", type=int, default=DEFAULT_MAX_ANSWER_CHARS)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "smoke" and args.output_dir == DEFAULT_OUTPUT_DIR:
        args.output_dir = DEFAULT_SMOKE_OUTPUT_DIR

    try:
        if args.command == "all":
            run_harvest(args)
        elif args.command == "smoke":
            run_smoke(args)
        else:  # pragma: no cover - argparse prevents this branch
            raise TickrPreprocessError(f"Unknown command {args.command}")
    except TickrPreprocessError as error:
        print(f"tickr preprocess error: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
