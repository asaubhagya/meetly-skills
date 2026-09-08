# Platform-specific Meetly setup guidance

Download for iPhone, iPad or Mac: https://apps.apple.com/app/id6747639933.
No recording/settings/calendar/voice-training destination deep links are verified.
Use the navigation below; never invent a meetly:// URL or claim a setting changed.

Labels verified against native source on 2026-09-08. Use the user's current
app if its version differs. Source inspection validates labels, not the user's
connection, permissions, training status, or installed version.

## iPhone / iPad

- AI connection: Settings → **AI Agent Access**. Follow **Restore AI Agent Access**
  if shown. The section provides the **Connected AI Agent Key** and **Setup
  instructions**; without entitlement it offers **Enable Access** with a Pro
  badge. Let the user copy the connection key into the host's Meetly authorization
  page, never into the conversation. **Sync to Meetly Cloud** controls new encrypted
  transcript/summary/action uploads; enabling access and enabling uploads are
  distinct choices. Previously synced context can remain accessible when sync is
  off. The separate quick-connect sheet is titled **Connect to AI**—that is not
  the Settings section name.
- Calendar: Settings → **Calendar** → **Show today’s events on Home**. Follow the
  app's permission prompt. If denied/restricted, it shows **Calendar access is off
  in System Settings** and **Open System Settings**. This is a read-only display
  of remaining timed events today, not evidence that MCP can read the calendar.
- Voice: Settings → **Beta Features** → **Speaker Labels**, then **Train My Voice**
  (or **My Voice Trained**). Speaker Labels must be enabled and its model downloaded
  before training is available. Follow the app's Pro/download prompts if shown.

## Native Mac app

- In the library, choose **Connect to AI**. The sheet is titled **Connect Meetly
  to AI**, with **Enable AI access**, **Add the Meetly MCP server**, and **Ask for
  the outcome**. When a key is recovered from encrypted iCloud Keychain, use
  **Copy Connection Key**. If absent, the sheet instructs the user to create it
  once on iPhone/iPad through Settings → AI Agent Access, then recover that same
  key on Mac. Do not invent a Mac Settings → AI Agent Access section.
- Voice: Settings → **Meeting Transcription** → **Speaker Identification**.
  Download the model/follow **Unlock Pro…** if needed; once ready, **Train My Voice**
  has a **Train…** button (or **My Voice Trained** with **Manage…**).
- No calendar connection control was found in the inspected native Mac settings.
  Offer the iPhone/iPad Calendar flow if applicable, or ask the user to check their
  app version's help. Do not invent a Mac calendar setup path.

For recording, guide a short test through the app's visible recording controls
and have the user confirm it appears in their library; MCP cannot certify device
recording readiness. Use the host's current connector instructions rather than
assuming its menu labels match those embedded in an older app release.

## Source references

Paths in the Meetly application source tree (not required runtime attachments):

- `apps/ios-macos/ActNote/Views/SettingsView.swift`: mcpSection, calendarSection,
  betaFeaturesSection, speakerLabelsBlock.
- `apps/ios-macos/ActNote/Views/MCPQuickConnectView.swift`: quick-connect title/sync.
- `apps/ios-macos/MeetlyMac/MacLibraryView.swift`: library connection button and
  Meeting Transcription settings.
- `apps/ios-macos/MeetlyMac/MacAIConnectionView.swift`: key recovery and connection.
- `agents/mcp/infra/mcp-proxy/api/_consent-page.ts`: Settings → AI Agent Access.

MCP prompts and the authorization page should use these same native labels.
If the installed app differs, follow its visible controls rather than guessing.
