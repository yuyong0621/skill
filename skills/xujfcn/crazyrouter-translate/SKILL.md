---
name: crazyrouter-translate
description: AI-powered translation via Crazyrouter. Translate text between any languages using GPT-5, Claude, DeepSeek, or Qwen. Supports file translation and multi-model comparison. Use when user asks to translate text, documents, or compare translations.
---

# AI Translation via Crazyrouter

Translate text between any languages using the best AI models through [Crazyrouter](https://crazyrouter.com).

## Script Directory

**Agent Execution**:
1. `SKILL_DIR` = this SKILL.md file's directory
2. Script path = `${SKILL_DIR}/scripts/main.ts`

## Step 0: Check API Key ⛔ BLOCKING

```bash
echo "${CRAZYROUTER_API_KEY:-not_set}"
```

## Usage

```bash
# Basic translation
npx -y bun ${SKILL_DIR}/scripts/main.ts --text "Hello world" --to zh

# Translate file
npx -y bun ${SKILL_DIR}/scripts/main.ts --input article.md --to ja --output article_ja.md

# Use specific model
npx -y bun ${SKILL_DIR}/scripts/main.ts --text "Bonjour le monde" --to en --model deepseek-r1

# Specify source language
npx -y bun ${SKILL_DIR}/scripts/main.ts --text "你好世界" --from zh --to ko

# Keep formatting (Markdown)
npx -y bun ${SKILL_DIR}/scripts/main.ts --input README.md --to ja --output README_ja.md --format markdown
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--text <text>` | Text to translate | — |
| `--input <file>` | Read from file | — |
| `--output <file>` | Save to file | stdout |
| `--from <lang>` | Source language | auto-detect |
| `--to <lang>` | Target language (required) | — |
| `--model <id>` | AI model | `gpt-4o-mini` |
| `--format <fmt>` | `plain` or `markdown` | `plain` |

### Language Codes

en, zh, ja, ko, es, fr, de, pt, ru, ar, vi, th, id, tr, it, pl, nl, sv, hi, ...
