---
name: clawdna
description: Generate a public, privacy-safe wiki-style profile (persona/card/bio/about) from full OpenClaw history. Use when users ask to summarize who this agent is, what it consistently does, and what it is known for based on historical behavior (not guesses).
---

# History Wiki Profile (Public Privacy Version)

## Goal

Produce a concise, interesting, wiki-style profile from **full historical behavior**.
Output must be factual, standardized, and privacy-safe.

---

## Installation

Preferred (ClawHub CLI):

```bash
clawhub install clawdna
```

Manual:

```bash
git clone <repo-url-containing-clawdna-skill> ~/.openclaw/skills/clawdna
```

After install, start a new OpenClaw session so the skill is loaded.

---

## When to Use

Trigger this skill only on explicit user intent to run ClawDNA, e.g.:
- "use ClawDNA"
- "/clawdna"
- "generate with ClawDNA"

Do not auto-trigger from generic biography/chat requests unless the user explicitly asks for ClawDNA.

---

## Mandatory Data Scope

Analyze full accessible history, not recent-only:
1. `~/.openclaw/agents/<agentId>/sessions/*.jsonl`
2. `memory/*.md`
3. `MEMORY.md` (if allowed in current context)

If primary session path misses data, auto-discover accessible session directories and continue.

---

## Non-Negotiable Rules

1. Full-history required.
2. No speculation. If unsupported, omit.
3. Public privacy output only (redacted by default).
4. Show **time span only** in coverage note (no file-count disclosure).
5. Keep sections standardized.
6. `Core Capabilities` and `Representative Work` must be **titles only**.
7. Output language must follow the user's current language by default.
8. Keep proper nouns/agent names in original form (do not translate names).

---

## Required Tooling

Use `jq` as primary parser for JSONL logs.
Use `rg/grep/awk` only as helpers.

Core commands (adapt path/agentId):

```bash
# message events
jq -c 'select(.type=="message")' ~/.openclaw/agents/<agentId>/sessions/*.jsonl

# assistant text
jq -r 'select(.type=="message" and .message.role=="assistant")
| .message.content[]? | select(.type=="text") | .text' \
~/.openclaw/agents/<agentId>/sessions/*.jsonl

# tool calls (action signals)
jq -r 'select(.type=="message" and .message.role=="assistant")
| .message.content[]? | select(.type=="toolCall")
| "\(.name)\t\(.arguments|tostring)"' \
~/.openclaw/agents/<agentId>/sessions/*.jsonl

# time span
jq -r '.timestamp // empty' ~/.openclaw/agents/<agentId>/sessions/*.jsonl \
| sort | sed -n '1p;$p'
```

---

## Extraction Method (High-Coverage)

### Step 1: Full Index
Extract:
- first active timestamp
- latest active timestamp
- interaction surfaces (chat/thread/cron/subsession)
- recurring action clusters

### Step 2: Broad Action Recognition
Classify signals across these families:
- Execution: edit/fix/deploy/restart/cleanup/release
- Collaboration: reply/thread/split/coordinate/follow-up
- Analysis: search/compare/evaluate/summarize/review
- Operations: monitor/alert/healthcheck/recovery/stability
- Creation: write/generate/design/propose/script
- Governance: confirm/risk-gate/privacy-redaction/boundary

Require multilingual synonym handling and tool+text cross-signals.

### Step 3: Stability Filtering
Only keep patterns repeated across time windows.
Single events cannot become personality traits.

### Step 4: Map to Wiki Sections
Map stable signals into fixed sections below.

### Step 5: Privacy Redaction
Remove or generalize secrets, direct identifiers, sensitive internal references.

---

## Context Overflow Strategy (Required)

When history is too large for context:
1. Build metadata index first (do not load raw text fully).
2. Process logs in time chunks (week/month windows).
3. Produce per-chunk structured summaries with fixed keys.
4. Merge summaries (map-reduce style) into final profile.
5. If conflicts exist, keep high-frequency cross-window patterns.

---

## Output (Single Display File)

Return one Markdown display profile only.
Do not output audit appendix.

Style requirement:
- Avoid rigid phrasing like "OpenClaw instance" in final prose.
- Prefer natural, human-readable role descriptions in the user's language.

---

## Fixed Output Template

# {{Name}}

## Lead
{{1 paragraph: identity + start time + stable traits + value}}

## Infobox
- Name: {{}}
- Type: {{execution/creative/analysis/operations/hybrid}}
- First Activation: {{YYYY-MM-DD}}
- Active Time Span: {{Start ~ Now}}
- Total Tokens: {{optional; include only if reliably available from full history, otherwise omit}}
- Primary Domains: {{max 3}}
- Interaction Style: {{}}
- Collaboration Mode: {{}}
- Default Principles: {{privacy-first / risk-confirmation / rollback-first}}

## Origin & Evolution
- Initial Stage: {{}}
- Evolution Stage: {{}}
- Current Stage: {{}}

## Operating Method
- {{}}
- {{}}
- {{}}

## Personality Snapshot
{{2-3 short behavior-based sentences}}

## Core Capabilities
- {{title only}}
- {{title only}}
- {{title only}}

## Representative Work
- {{title only}}
- {{title only}}
- {{title only}}

## Milestones
- {{Date}}: {{}}
- {{Date}}: {{}}
- {{Date}}: {{}}

## Collaboration Guide
- Best Input: {{goal / constraints / priority / deadline}}
- Best Rhythm: {{}}
- Preferred Output: {{}}

## Boundaries & Safety
- {{}}
- {{}}
- {{}}

## Persona Tags
{{tag1}} / {{tag2}} / {{tag3}} / {{tag4}}

## Ending
{{Use a short closing in the user's language, e.g.}}
{{Preset persona = initial intent; long-term behavior = real persona; user habits = persona shaper.}}

---

## Final Checks Before Output

- Full history used (not recent-only)
- No speculative claims
- Core Capabilities & Representative Work are title-only
- Privacy-safe wording
- Coverage includes time span only
