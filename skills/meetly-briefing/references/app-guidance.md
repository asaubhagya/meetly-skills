# Meetly connection and app guidance

Download for iPhone, iPad or Mac: https://apps.apple.com/app/id6747639933.
Use the installed app's visible labels if its version differs. Never invent a
settings deep link or claim that a setting changed without confirmation.

## Access and recovery

First read `get_meetly_usage_guide`.
If connected/readAllowed are true, proceed to the requested meeting read.
Missing preferences, empty results and missing generated summaries do not mean
AI access is disabled. Do not repeat phone approval after success.

For a real expired/revoked connection error, use Meetly's connection controls in
ChatGPT: **Change connection** or **Reconnect**, authenticate, approve on the
phone if requested, then select the updated connection in ChatGPT. If an old
conversation retains the previous connection, start a new one with the updated
Meetly connection. Other hosts use their own connection controls. The maintained
help page is https://getmeetly.ai/mcp/reconnect?client=chatgpt.

For an explicit `ACCESS_PAUSED`, current iPhone source uses Settings →
**AI & summaries** → **Agent Connector**, opening **AI connections** with
**Allow AI access**. Resume the paused access and retry. Older versions may use
different labels; follow the installed app. Do not disable/re-enable working
access as a troubleshooting ritual.

**Cloud summaries** in Settings → **AI & summaries** controls Meetly's summary
processing. It is independent of AI meeting access and transcript synchronization.
ChatGPT can read approved synced transcripts without it. MCP does not receive the
device's Cloud Summary setting, so report it as unknown rather than guessing.

Successful empty results require checking dates/filters, transcript sync and
index coverage. `SOURCE_NOT_SYNCED` means the selected transcript is unavailable,
not that phone approval failed. Device-only recordings remain unavailable to MCP.
Preserve audio and existing sync choices; never ask for CloudKit tokens, connection
keys, or private credentials in chat.

## Other app help

For a first recording, use the app's visible recording controls and confirm it
appears in the library and its transcript sync completes. MCP cannot certify
microphone permissions or device recording readiness.

Calendar and voice-training controls vary by platform/version; follow the app's
visible Settings and permission prompts. Calendar invitees are not verified
speakers. Do not invent Mac-only or iPhone-only prerequisites for an already
approved connection.

## Evidence

Labels checked against current native source on 2026-09-17:
`ActNote/Views/SettingsView.swift` and
`ActNote/Views/AIConnections/AIConnectionsScreen.swift`.
Consent independence: `ActNote/Services/CloudProcessingConsent.swift`.
These source checks do not establish the user's installed version or local state.
