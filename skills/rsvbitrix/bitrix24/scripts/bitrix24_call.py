#!/usr/bin/env python3
"""Call Bitrix24 REST methods using saved config or explicit URL."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from urllib import error, parse, request

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from bitrix24_config import load_url, normalize_url, persist_url_to_config, validate_url, cache_user_data  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Call a Bitrix24 REST method.")
    parser.add_argument("method", help="REST method, e.g. user.current or calendar.event.get")
    parser.add_argument("--url", help="Webhook URL (saved to config automatically)")
    parser.add_argument("--config-file", help="Config file path override")
    parser.add_argument(
        "--param",
        action="append",
        default=[],
        help="Request parameter in key=value form; repeat as needed",
    )
    parser.add_argument("--timeout", type=float, default=20.0, help="HTTP timeout in seconds")
    parser.add_argument("--json", action="store_true", help="Pretty-print JSON response")
    return parser.parse_args()


def parse_params(raw_params: list[str]) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    for item in raw_params:
        if "=" not in item:
            raise ValueError(f"Invalid --param '{item}'. Use key=value.")
        key, value = item.split("=", 1)
        out.append((key, value))
    return out


def main() -> int:
    args = parse_args()
    raw_url, source = load_url(cli_url=args.url, config_file=args.config_file)
    if not raw_url:
        print(json.dumps({"ok": False, "error": "No Bitrix24 webhook configured", "source": source}, ensure_ascii=True, indent=2))
        return 1

    normalized_url = validate_url(raw_url)

    if not source.startswith("config:"):
        persist_url_to_config(normalized_url, args.config_file)

    try:
        params = parse_params(args.param)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    method = args.method[:-5] if args.method.endswith(".json") else args.method
    url = normalize_url(normalized_url) + f"{method}.json"
    data = parse.urlencode(params).encode("utf-8")
    req = request.Request(url, data=data, headers={"Accept": "application/json"})

    try:
        with request.urlopen(req, timeout=args.timeout) as response:
            payload = response.read().decode("utf-8", errors="replace")
            status = response.getcode()
    except error.HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="replace")
        status = exc.code
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc), "source": source}, ensure_ascii=True, indent=2))
        return 1

    try:
        body = json.loads(payload)
    except Exception:
        body = {"raw": payload}

    result = {"ok": status < 400, "status": status, "source": source, "body": body}

    # Auto-cache user_id and timezone after successful user.current call
    if method == "user.current" and status < 400 and isinstance(body, dict):
        user_result = body.get("result", {})
        uid = user_result.get("ID")
        tz = user_result.get("TIME_ZONE", "")
        if uid:
            try:
                cache_user_data(int(uid), tz, args.config_file)
            except Exception:
                pass

    if args.json:
        print(json.dumps(result, ensure_ascii=True, indent=2))
    else:
        print(json.dumps(result, ensure_ascii=True))
    return 0 if status < 400 else 1


if __name__ == "__main__":
    sys.exit(main())
