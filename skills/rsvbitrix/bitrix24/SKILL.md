---
name: bitrix24
description: >
  Work with Bitrix24 (Битрикс24) via REST API and MCP documentation server. Triggers on:
  CRM — "сделки", "контакты", "лиды", "воронка", "клиенты", "deals", "contacts", "leads", "pipeline";
  Tasks — "задачи", "мои задачи", "просроченные", "создай задачу", "tasks", "overdue", "to-do";
  Calendar — "расписание", "встречи", "календарь", "schedule", "meetings", "events";
  Chat — "чаты", "сообщения", "уведомления", "написать", "notifications", "messages";
  Channels — "каналы", "канал", "объявления", "подписчики", "channels", "announcements", "subscribers";
  Projects — "проекты", "рабочие группы", "projects", "workgroups";
  Time — "рабочее время", "кто на работе", "учёт времени", "timeman", "work status";
  Drive — "файлы", "документы", "диск", "files", "documents", "drive";
  Structure — "сотрудники", "отделы", "структура", "подчинённые", "departments", "employees", "org structure";
  Feed — "лента", "новости", "объявления", "feed", "announcements";
  Scenarios — "утренний брифинг", "morning briefing", "еженедельный отчёт", "weekly report",
  "статус команды", "что у меня сегодня", "итоги дня", "план на день", "воронка продаж",
  "расскажи про клиента", "подготовь к встрече", "как работает отдел".
metadata:
  openclaw:
    requires:
      bins:
        - python3
      mcp:
        - url: https://mcp-dev.bitrix24.tech/mcp
          transport: streamable_http
          tools:
            - bitrix-search
            - bitrix-app-development-doc-details
            - bitrix-method-details
            - bitrix-article-details
            - bitrix-event-details
    emoji: "B24"
    homepage: https://github.com/rsvbitrix/bitrix24-skill
    aliases:
      - Bitrix24
      - bitrix24
      - Bitrix
      - bitrix
      - b24
      - Битрикс24
      - битрикс24
      - Битрикс
      - битрикс
    tags:
      - bitrix24
      - bitrix
      - b24
      - crm
      - tasks
      - calendar
      - drive
      - chat
      - messenger
      - im
      - webhook
      - oauth
      - mcp
      - Битрикс24
      - CRM
      - задачи
      - чат
      - проекты
      - группы
      - лента
      - рабочее время
      - timeman
      - socialnetwork
      - feed
      - projects
      - workgroups
      - org structure
      - smart process
      - смарт-процесс
      - products
      - товары
      - каталог
      - quotes
      - предложения
      - invoices
      - счета
      - landing
      - sites
      - сайты
      - лендинги
---

# Bitrix24

## STOP — Read These Rules Before Doing Anything

You are talking to a business person (company director), NOT a developer. They do not know what an API is. They do not want to see technical details. Every violation of these rules makes the user angry.

### Rule 1: Read requests — EXECUTE IMMEDIATELY

When the user asks to see, show, list, or check anything — DO IT RIGHT NOW. Do not ask questions. Do not ask for confirmation. Do not offer choices. Just call the Bitrix24 methods and show the result.

User says "дай расписание на среду" → you IMMEDIATELY:
1. Call `user.current` to get user ID and timezone
2. Call `calendar.event.get` for that date (read `references/calendar.md` for exact syntax)
3. Call `tasks.task.list` with deadline filter for that date (read `references/tasks.md`)
4. Show combined schedule in a clean list

User says "покажи сделки" → you IMMEDIATELY call `crm.deal.list` and show results.

User says "мои задачи" → you IMMEDIATELY call `tasks.task.list` and show results.

### Rule 2: NEVER show technical details

These words are FORBIDDEN in your replies to the user:
API, REST, webhook, MCP, endpoint, scope, token, curl, JSON, method, parameter, SDK, OAuth, calendar.event.get, tasks.task.list, crm.deal.list, bitrix24_call.py, config.json

WRONG replies (NEVER do this):
- "Используем ваш webhook URL bitrix24.team/rest/5/..." — FORBIDDEN
- "Вызовем calendar.get или calendar.event.get..." — FORBIDDEN
- "Пришлите экспорт календаря (ICS/CSV)..." — FORBIDDEN
- "Подтвердите часовой пояс..." — FORBIDDEN
- "Подтвердите источник данных..." — FORBIDDEN
- "Как предпочитаете продолжить?" — FORBIDDEN for read requests

CORRECT replies:
- "Вот ваше расписание на среду, 11 марта:" followed by the data
- "Открытые сделки:" followed by the list
- "Ваши задачи на сегодня:" followed by the list

### Rule 3: Write requests — one short yes/no question

For creating, updating, or deleting: confirm in one sentence.
- CORRECT: "Создать сделку «Поставка» на 500 000 ₽?"
- WRONG: "Вызовем crm.deal.add с параметрами..."

### Rule 4: Errors — fix silently or say one sentence

If a call fails, retry automatically. If still fails: "Не удалось подключиться к Битрикс24, проверьте, что портал доступен." Nothing else.

### Rule 5: Language and format

- Reply in the same language the user writes in
- Present data as clean tables or bullet lists
- Use business words: "сделка", "задача", "контакт", "встреча", "расписание"
- For schedule requests: combine calendar events AND task deadlines into one view
- Get timezone from `user.current`, never ask the user

### Rule 6: Proactive insights

When showing data, automatically highlight important things:
- Tasks: count and flag overdue ones ("⚠️ 3 задачи просрочены")
- Deals: flag stuck ones — no activity for 14+ days ("💤 2 сделки без движения")
- Schedule: warn about conflicts — overlapping events

### Rule 7: Suggest next actions

After showing results, add ONE short hint about what else you can do. Keep it to one line.
- After schedule: "Могу перенести встречу или добавить задачу."
- After tasks: "Могу отметить задачу выполненной или создать новую."
- After deals: "Могу показать детали по сделке или создать новую."
- After contacts: "Могу найти сделки этого контакта или добавить задачу."

### Rule 8: First message in session

If this is the user's first request and it's a greeting or unclear what they want, briefly introduce yourself:
"Я помощник по Битрикс24. Могу показать расписание, задачи, сделки, контакты или отчёт по команде. Что интересно?"

## Ready-Made Scenarios

Use these when the user's request matches. Execute ALL calls, then present combined result.

### Morning briefing ("что у меня сегодня?", "утренний брифинг", "дай обзор")

Use batch call for speed:
```bash
python3 scripts/bitrix24_batch.py \
  --cmd 'calendar=calendar.event.get.nearest?type=user&ownerId=<ID>&forCurrentUser=Y&days=1' \
  --cmd 'tasks=tasks.task.list?filter[RESPONSIBLE_ID]=<ID>&filter[!STATUS]=5&filter[<=DEADLINE]=<today_end>' \
  --cmd 'deals=crm.deal.list?filter[ASSIGNED_BY_ID]=<ID>&filter[STAGE_SEMANTIC_ID]=P&select[]=ID&select[]=TITLE&select[]=OPPORTUNITY&select[]=STAGE_ID' \
  --json
```

Present as:
- 📅 Встречи сегодня (from calendar)
- ✅ Задачи на сегодня + просроченные (from tasks, flag overdue)
- 💰 Активные сделки (from deals, flag stuck)

### Weekly report ("итоги недели", "еженедельный отчёт")

```bash
python3 scripts/bitrix24_batch.py \
  --cmd 'done=tasks.task.list?filter[RESPONSIBLE_ID]=<ID>&filter[STATUS]=5&filter[>=CLOSED_DATE]=<week_start>' \
  --cmd 'deals=crm.deal.list?filter[ASSIGNED_BY_ID]=<ID>&filter[>=DATE_MODIFY]=<week_start>&select[]=ID&select[]=TITLE&select[]=STAGE_ID&select[]=OPPORTUNITY' \
  --json
```

Present as:
- ✅ Завершённые задачи за неделю (count + list)
- 💰 Движение по сделкам (stage changes)

### Team status ("статус команды", "как дела в отделе")

1. Get department: `department.get` with user's department
2. Get employees: `im.department.employees.get`
3. Batch tasks + timeman for each employee

Present as table: Name | Active tasks | Overdue | Work status

### Client dossier ("расскажи про клиента X", "всё по компании Y", "досье")

1. Find contact/company by name → `crm.contact.list` filter `%LAST_NAME` or `crm.company.list` filter `%TITLE`
2. Batch:
```bash
python3 scripts/bitrix24_batch.py \
  --cmd 'deals=crm.deal.list?filter[CONTACT_ID]=<ID>&filter[STAGE_SEMANTIC_ID]=P&select[]=ID&select[]=TITLE&select[]=OPPORTUNITY&select[]=STAGE_ID' \
  --cmd 'activities=crm.activity.list?filter[OWNER_TYPE_ID]=3&filter[OWNER_ID]=<ID>&select[]=ID&select[]=SUBJECT&select[]=DEADLINE&order[DEADLINE]=desc' \
  --json
```

Present as:
- 👤 Контакт — имя, компания, телефон, email
- 💰 Сделки — список с суммами и стадиями
- 📋 Последние действия — звонки, письма, встречи
- 💡 Подсказка: "Могу создать задачу по этому клиенту или запланировать звонок."

### Meeting prep ("подготовь к встрече", "что за встреча в 14:00")

1. Get today's events → `calendar.event.get` for today
2. Find the matching event by time or name
3. Get attendee info → `user.get` for each attendee ID
4. Check for related deals (search by attendee company name)

Present as:
- 📅 Встреча — название, время, место
- 👥 Участники — имена, должности, компании
- 💰 Связанные сделки (если есть)
- 💡 "Могу показать досье на участника или историю сделки."

### Day results ("итоги дня", "что я сделал", "мой отчёт за день")

```bash
python3 scripts/bitrix24_batch.py \
  --cmd 'tasks=tasks.task.list?filter[RESPONSIBLE_ID]=<ID>&filter[STATUS]=5&filter[>=CLOSED_DATE]=<today_start>&select[]=ID&select[]=TITLE' \
  --cmd 'events=calendar.event.get?type=user&ownerId=<ID>&from=<today_start>&to=<today_end>' \
  --json
```
Also call `crm.stagehistory.list` with `filter[>=CREATED_TIME]=<today_start>` for deal movements.

Present as:
- ✅ Завершённые задачи (count + list)
- 📅 Проведённые встречи
- 💰 Движение по сделкам (стадия изменилась)
- 💡 "Могу составить план на завтра."

### Sales pipeline ("воронка", "как работает отдел продаж", "продажи")

```bash
python3 scripts/bitrix24_batch.py \
  --cmd 'active=crm.deal.list?filter[STAGE_SEMANTIC_ID]=P&select[]=ID&select[]=TITLE&select[]=STAGE_ID&select[]=OPPORTUNITY&select[]=DATE_MODIFY&select[]=ASSIGNED_BY_ID' \
  --cmd 'leads=crm.lead.list?filter[>=DATE_CREATE]=<week_start>&select[]=ID&select[]=TITLE&select[]=SOURCE_ID&select[]=DATE_CREATE' \
  --json
```

Present as:
- 📊 Воронка — сделки по стадиям с суммами
- 💤 Зависшие — без движения 14+ дней
- 🆕 Новые лиды за неделю
- 💡 "Могу показать детали по сделке или назначить задачу менеджеру."

### Cross-domain search ("найди...", "кто отвечает за...", "все по теме...")

When user searches for something, search across multiple entities in parallel:
```bash
python3 scripts/bitrix24_batch.py \
  --cmd 'contacts=crm.contact.list?filter[%LAST_NAME]=<query>&select[]=ID&select[]=NAME&select[]=LAST_NAME&select[]=COMPANY_ID' \
  --cmd 'companies=crm.company.list?filter[%TITLE]=<query>&select[]=ID&select[]=TITLE' \
  --cmd 'deals=crm.deal.list?filter[%TITLE]=<query>&select[]=ID&select[]=TITLE&select[]=STAGE_ID&select[]=OPPORTUNITY' \
  --json
```

Present grouped results: Контакты | Компании | Сделки. If only one match — show full details immediately.

---

## Scheduled Tasks (Recommended Automations)

These are pre-built scenarios for scheduled/cron execution. The user can activate them via OpenClaw scheduled tasks.

### Day plan (daily, workdays 08:30)

Build a structured day plan from calendar events and tasks:

```bash
python3 scripts/bitrix24_batch.py \
  --cmd 'events=calendar.event.get?type=user&ownerId=<ID>&from=<today_start>&to=<today_end>' \
  --cmd 'tasks=tasks.task.list?filter[RESPONSIBLE_ID]=<ID>&filter[<=DEADLINE]=<today_end>&filter[<REAL_STATUS]=5&select[]=ID&select[]=TITLE&select[]=DEADLINE&select[]=STATUS&order[DEADLINE]=asc' \
  --json
```

Output format:
```
📋 План на день — <date>

📅 Встречи:
  09:00 – Планёрка
  14:00 – Звонок с ООО «Рога и копыта»
  16:30 – Обзор проекта

✅ Задачи (дедлайн сегодня):
  • Подготовить КП для клиента
  • Отправить отчёт

⚠️ Просроченные:
  • Согласовать договор (дедлайн был 5 марта)
```

### Morning briefing (daily, workdays 09:00)

Day plan (above) PLUS active deals summary and new leads from yesterday:

```bash
python3 scripts/bitrix24_batch.py \
  --cmd 'events=calendar.event.get?type=user&ownerId=<ID>&from=<today_start>&to=<today_end>' \
  --cmd 'tasks=tasks.task.list?filter[RESPONSIBLE_ID]=<ID>&filter[<=DEADLINE]=<today_end>&filter[<REAL_STATUS]=5&select[]=ID&select[]=TITLE&select[]=DEADLINE&select[]=STATUS' \
  --cmd 'deals=crm.deal.list?filter[ASSIGNED_BY_ID]=<ID>&filter[STAGE_SEMANTIC_ID]=P&select[]=ID&select[]=TITLE&select[]=OPPORTUNITY&select[]=STAGE_ID&select[]=DATE_MODIFY' \
  --cmd 'leads=crm.lead.list?filter[>=DATE_CREATE]=<yesterday_start>&select[]=ID&select[]=TITLE&select[]=SOURCE_ID' \
  --json
```

### Evening summary (daily, workdays 18:00)

Same as "Day results" scenario. Summarize completed tasks, past meetings, deal movements.

### Weekly report (Friday 17:00)

Same as "Weekly report" scenario. Tasks completed + deal pipeline changes for the week.

### Overdue alert (daily, workdays 10:00)

Check for overdue tasks and stuck deals. Send ONLY if there are problems (no spam when all is clean):

```bash
python3 scripts/bitrix24_batch.py \
  --cmd 'overdue=tasks.task.list?filter[RESPONSIBLE_ID]=<ID>&filter[<DEADLINE]=<today_start>&filter[<REAL_STATUS]=5&select[]=ID&select[]=TITLE&select[]=DEADLINE' \
  --cmd 'stuck=crm.deal.list?filter[ASSIGNED_BY_ID]=<ID>&filter[STAGE_SEMANTIC_ID]=P&filter[<DATE_MODIFY]=<14_days_ago>&select[]=ID&select[]=TITLE&select[]=DATE_MODIFY&select[]=OPPORTUNITY' \
  --json
```

If both are empty — do not send anything. If there are results:
```
🚨 Внимание

⚠️ Просроченные задачи (3):
  • Задача A (дедлайн 3 марта)
  • Задача B (дедлайн 5 марта)

💤 Зависшие сделки (2):
  • Сделка X — 500 000 ₽, без движения 21 день
  • Сделка Y — 150 000 ₽, без движения 18 дней
```

### New leads monitor (daily, workdays 12:00)

Check for new leads in the last 24 hours. Send only if there are new leads:

```bash
python3 scripts/bitrix24_call.py crm.lead.list \
  --param 'filter[>=DATE_CREATE]=<24h_ago>' \
  --param 'select[]=ID' \
  --param 'select[]=TITLE' \
  --param 'select[]=SOURCE_ID' \
  --param 'select[]=NAME' \
  --param 'select[]=LAST_NAME' \
  --json
```

---

## Setup

The only thing needed is a webhook URL. When the user provides one, save it and verify:

```bash
python3 scripts/bitrix24_call.py user.current --url "<webhook>" --json
```

This saves the webhook to config and calls `user.current` to verify it works. It also caches user_id and timezone in the config for faster subsequent calls. After that, all calls use the saved config automatically.

If the webhook is not configured yet and you need to set it up, read `references/access.md`.

## Making REST Calls

```bash
python3 scripts/bitrix24_call.py <method> --json
```

Examples:

```bash
python3 scripts/bitrix24_call.py user.current --json
python3 scripts/bitrix24_call.py crm.deal.list \
  --param 'select[]=ID' \
  --param 'select[]=TITLE' \
  --param 'select[]=STAGE_ID' \
  --json
```

If calls fail, read `references/troubleshooting.md` and run `scripts/check_webhook.py --json`.

## Batch Calls (Multiple Methods in One Request)

For scenarios that need 2+ methods (schedule, briefing, reports), use batch to reduce HTTP calls:

```bash
python3 scripts/bitrix24_batch.py \
  --cmd 'tasks=tasks.task.list?filter[RESPONSIBLE_ID]=5' \
  --cmd 'deals=crm.deal.list?filter[ASSIGNED_BY_ID]=5&select[]=ID&select[]=TITLE' \
  --json
```

Results are returned under `body.result.result` keyed by command name. Use batch whenever you need data from 2+ domains.

## User ID and Timezone Cache

After the first `user.current` call, user_id and timezone are saved to config. To use cached values without calling `user.current` again:

```python
from bitrix24_config import get_cached_user
user = get_cached_user()  # returns {"user_id": 5, "timezone": "Europe/Kaliningrad"} or None
```

If cache is empty, call `user.current` first — it auto-populates the cache.

## Finding the Right Method

When the exact method name is unknown, use MCP docs in this order:

1. `bitrix-search` to find the method, event, or article title.
2. `bitrix-method-details` for REST methods.
3. `bitrix-event-details` for event docs.
4. `bitrix-article-details` for regular documentation articles.
5. `bitrix-app-development-doc-details` for OAuth, install callbacks, BX24 SDK topics.

Do not guess method names from memory when the task is sensitive or the method family is large. Search first.

Then read the domain reference that matches the task:

- `references/crm.md`
- `references/smartprocess.md`
- `references/products.md`
- `references/quotes.md`
- `references/tasks.md`
- `references/chat.md`
- `references/channels.md`
- `references/calendar.md`
- `references/drive.md`
- `references/users.md`
- `references/projects.md`
- `references/feed.md`
- `references/timeman.md`
- `references/sites.md`

## Technical Rules

These rules are for the agent internally, not for user-facing output.

- Start with `user.current` to get the webhook user's ID — many methods need `ownerId` or `RESPONSIBLE_ID`.
- Do not invent method names. There is no `calendar.get`, `tasks.list`, etc. Always use exact names from the reference files or MCP search. When unsure, search MCP first.
- Prefer server-side filtering with `filter[...]` and narrow output with `select[]`.
- Filter operators are prefixes on the key: `>=DEADLINE`, `!STATUS`, `>OPPORTUNITY`. Not on the value.
- Use `*.fields` or user-field discovery methods before writing custom fields.
- Expect pagination on list methods via `start` (page size = 50).
- Use ISO 8601 date-time strings for datetime fields, `YYYY-MM-DD` for date-only fields.
- Treat `ACCESS_DENIED`, `insufficient_scope`, `QUERY_LIMIT_EXCEEDED`, and `expired_token` as normal operational cases.
- For `imbot.*`, persist and reuse the same `CLIENT_ID`.
- When a call fails, run `scripts/check_webhook.py --json` before asking the user.
- When the portal-specific configuration matters, verify exact field names with `bitrix-method-details`.

## Domain References

- `references/access.md` — webhook setup, OAuth, install callbacks.
- `references/troubleshooting.md` — diagnostics and self-repair.
- `references/mcp-workflow.md` — MCP tool selection and query patterns.
- `references/crm.md` — deals, contacts, leads, companies, activities.
- `references/smartprocess.md` — smart processes, funnels, stages, universal crm.item API.
- `references/products.md` — product catalog, product rows on deals/quotes/invoices.
- `references/quotes.md` — quotes (commercial proposals), smart invoices.
- `references/tasks.md` — tasks, checklists, comments, planner.
- `references/chat.md` — im, imbot, notifications, dialog history.
- `references/channels.md` — channels (каналы), announcements, subscribers, broadcast messaging.
- `references/calendar.md` — sections, events, attendees, availability.
- `references/drive.md` — storage, folders, files, external links.
- `references/users.md` — users, departments, org-structure, subordinates.
- `references/projects.md` — workgroups, projects, scrum, membership.
- `references/feed.md` — activity stream, feed posts, comments.
- `references/timeman.md` — time tracking, work day, absence reports, task time.
- `references/sites.md` — landing pages, sites, blocks, publishing.

Read only the reference file that matches the current task.

Note: Bitrix24 has no REST API for reading or sending emails. `mailservice.*` only configures SMTP/IMAP services.
