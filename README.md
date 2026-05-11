# Teams Always On

Teams Always On is a Chrome/Chromium browser extension that targets Microsoft Teams on the web and attempts to switch the Teams presence status from `Away` back to `Available`.

The extension is implemented as a Manifest V3 extension with a background service worker and a content script for `https://teams.microsoft.com/v2/*`.

## Requirements

- A Chromium-based browser that supports Manifest V3 extensions, such as Google Chrome or Microsoft Edge.
- Access to Microsoft Teams on the web at `https://teams.microsoft.com/v2/`.
- No Node.js package manager is required for the current source tree.

## Setup and run

1. Clone or download this repository.
2. Open your browser extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Enable `Developer mode`.
4. Choose `Load unpacked`.
5. Select the repository root directory containing `manifest.json`.
6. Open or sign in to Microsoft Teams at `https://teams.microsoft.com/v2/`.
7. Click the `Teams Always On` extension action:
   - If a Teams tab is active, the extension toggles the content script behavior on or off.
   - If another tab is active, the extension opens or focuses Teams.

## Scripts

This repository does not currently include a package manifest such as `package.json`, so there are no npm/yarn/pnpm scripts to run.


## Tests

No automated test framework or test command is currently present in the repository.

Suggested manual checks:

1. Load the unpacked extension in a Chromium-based browser.
2. Open `https://teams.microsoft.com/v2/` and sign in.
3. Confirm the extension action opens or focuses the Teams tab.
4. Confirm clicking the extension action on a Teams tab toggles the extension icon/title between enabled and disabled states.
5. When Teams shows the user as `Away`, confirm the content script can open the presence menu and choose `Available`.


## Project structure

```text
.
├── background.js                  # Manifest V3 background service worker
├── content.js                     # Content script injected into Teams web pages
├── manifest.json                  # Chrome extension manifest
├── images/
│   ├── icon-128.png               # Enabled extension icon
│   ├── icon-128-disabled.png      # Disabled extension icon
│   └── icon-256.png               # Larger project icon asset
└── TeamsAlwaysOn.iml              # IntelliJ IDEA module file
```

## Entry points

- `manifest.json` declares the extension metadata, permissions, content script, icons, and Manifest V3 background service worker.
- `background.js` handles extension startup/install events, action button clicks, alarms, keep-awake behavior, context menu reload behavior, and Teams tab focusing/opening.
- `content.js` runs on Teams web pages and periodically checks whether the Teams presence label includes `Away`; when it does, it attempts to select `Available` from the Teams presence menu.

## Permissions and host access

The extension declares these Chrome extension permissions:

- `power`
- `contextMenus`
- `activeTab`
- `alarms`

It also declares host access for:

- `https://teams.microsoft.com/v2/*`

## License

This project is licensed for non-commercial use only.

Copyright (c) 2024. All rights reserved.
