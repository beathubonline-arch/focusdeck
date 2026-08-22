# FocusDeck

Personal task tracker + "What Now" engine. Tested and working.

## Run it right now

```bash
cd focusdeck
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Open **http://localhost:8000** in your browser.

That's it — SQLite database (`focusdeck.db`) is created automatically on
first run, with four starter projects (BizSure, Matatu Mayhem, Beat
Platform, Signalworks Content) already seeded.

## How to use it

- **Add tasks** with a title, project, priority, time estimate, and
  optional deadline.
- Hit **"What should I do now?"** — it scores every open task against
  urgency, priority, and how much free time you have, and gives you one
  clear answer plus 3 runners-up.
- No Calendar connected yet? Use the **manual override** field to type
  in how many minutes you actually have free right now.
- Mark tasks **✓ Done** or **✕ delete** them straight from the list.

## Enabling real Google Calendar sync (optional)

Without this, "What Now" defaults to assuming 120 free minutes (or
whatever you type into the manual override). To pull your real
calendar gaps instead:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/),
   create a project, and enable the **Google Calendar API**.
2. Create OAuth credentials of type **Desktop app**, download the JSON,
   and save it as `credentials.json` in this folder.
3. Install the extra Calendar dependencies (already in
   `requirements.txt`, but if you skipped them):
   ```bash
   pip install google-auth-oauthlib google-api-python-client
   ```
4. Run:
   ```bash
   python calendar_sync.py
   ```
   A browser window opens asking you to authorize. This creates
   `token.json`.
5. Restart the server. The "What Now" card will now show a 📅 icon and
   pull real gaps from your calendar instead of the default.

`credentials.json` and `token.json` are already in `.gitignore` — never
commit them.

## Deploying (Railway / Render)

Same pattern as your other FastAPI apps:

1. Push this folder to a GitHub repo (check `.gitignore` is respected —
   don't commit `focusdeck.db`, `credentials.json`, or `token.json`).
2. On Railway/Render, point it at the repo, set the start command to:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
3. SQLite works fine for a single-user deployed instance, but if you
   want it accessible from your phone *and* laptop simultaneously,
   deploying it once (rather than running locally on one machine) is
   what makes that work — the file lives on the server, not your laptop.

## Project structure

```
focusdeck/
├── main.py              # FastAPI app + all routes
├── models.py             # SQLAlchemy models (Project, Task)
├── database.py            # SQLite engine/session setup
├── what_now.py           # scoring engine — the actual "brain"
├── calendar_sync.py      # optional Google Calendar integration
├── templates/
│   ├── index.html          # main page
│   ├── _tasks_list.html     # htmx fragment: task list
│   ├── _what_now.html       # htmx fragment: what-now result
│   └── _project_options.html # htmx fragment: project dropdown
├── static/
│   └── style.css           # Signalworks-style dark theme
├── requirements.txt
└── .gitignore
```

## What to build next (phase 2 ideas)

- Swap `what_now.py`'s rule-based scoring for a call to the Claude API
  that reasons over your tasks in plain language and explains *why* it
  picked something — useful when the rules feel off.
- Add a `FocusLog` table (already sketched in the original design doc)
  to track what you actually worked on, so you can spot patterns over
  time (e.g. "I always skip beat-platform tasks after 6pm").
- Add a "snooze" button so a task doesn't keep winning What Now if
  you're deliberately avoiding it right now.
