"""
Optional Google Calendar integration.

FocusDeck works fully without this — it just falls back to a default
free-time window (see DEFAULT_FREE_MINUTES below) or whatever you type
into the manual override field on the dashboard.

To enable real Calendar sync:
  1. Go to https://console.cloud.google.com/ -> create a project ->
     enable the "Google Calendar API".
  2. Create OAuth credentials (type: Desktop app) and download the
     JSON file. Save it as `credentials.json` in this folder.
  3. Run `python calendar_sync.py` once — a browser window will open
     asking you to authorize. This creates `token.json`.
  4. Restart the FocusDeck server. It will now pull your real calendar.

Never commit credentials.json or token.json to git — they're already
listed in .gitignore.
"""
import os
from datetime import datetime, timedelta

DEFAULT_FREE_MINUTES = 120
SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
CREDENTIALS_FILE = "credentials.json"
TOKEN_FILE = "token.json"


def _load_creds():
    if not os.path.exists(TOKEN_FILE):
        return None
    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request

        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(TOKEN_FILE, "w") as f:
                f.write(creds.to_json())
        return creds
    except Exception:
        return None


def calendar_is_configured() -> bool:
    return os.path.exists(TOKEN_FILE)


def get_free_minutes_until_next_event() -> tuple[int, str]:
    """
    Returns (free_minutes, source) where source is "calendar" or "default".
    Never raises — always safe to call even if Calendar isn't set up.
    """
    creds = _load_creds()
    if not creds:
        return DEFAULT_FREE_MINUTES, "default"

    try:
        from googleapiclient.discovery import build

        service = build("calendar", "v3", credentials=creds)
        now = datetime.utcnow().isoformat() + "Z"
        events = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=now,
                maxResults=1,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
            .get("items", [])
        )

        if not events:
            return 240, "calendar"  # nothing else today — assume a big block

        next_start = events[0]["start"].get("dateTime")
        if not next_start:
            return DEFAULT_FREE_MINUTES, "default"

        start_dt = datetime.fromisoformat(next_start.replace("Z", "+00:00")).replace(
            tzinfo=None
        )
        delta = start_dt - datetime.utcnow()
        return max(int(delta.total_seconds() / 60), 0), "calendar"
    except Exception:
        return DEFAULT_FREE_MINUTES, "default"


def _run_first_time_auth():
    """Run this file directly (`python calendar_sync.py`) to authorize once."""
    from google_auth_oauthlib.flow import InstalledAppFlow

    if not os.path.exists(CREDENTIALS_FILE):
        print(
            f"Missing {CREDENTIALS_FILE}. Follow the setup steps in the "
            "docstring at the top of this file first."
        )
        return

    flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
    creds = flow.run_local_server(port=0)
    with open(TOKEN_FILE, "w") as f:
        f.write(creds.to_json())
    print(f"Authorized. Saved {TOKEN_FILE}. Restart the FocusDeck server.")


if __name__ == "__main__":
    _run_first_time_auth()
