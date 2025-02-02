# Twitch Community Points Collector

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/majieidmeiejjbodclcekfppoeeonfgf)](https://chromewebstore.google.com/detail/twitch-community-points-c/majieidmeiejjbodclcekfppoeeonfgf)

A lightweight Chrome extension that automatically collects Twitch community points for you, so you don't have to!

## Features
- Automatically claims Twitch community points while you watch streams.
- Tracks and displays a leaderboard based on collected points.
- Shows total points collected from different channels.
- Runs as a content script on Twitch pages.
- No user interaction required—just install and enjoy!

## Installation

You can install the extension directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/twitch-community-points-c/majieidmeiejjbodclcekfppoeeonfgf).

## Development Setup

This project is built using [Bun](https://bun.sh/).

### Prerequisites
- [Bun](https://bun.sh/) installed on your system.
- Chrome (or a Chromium-based browser) to load the extension.

### Clone the Repository
```sh
git clone https://github.com/sinanovicanes/twitch-community-points-collector.git
cd twitch-community-points-collector
```

### Install Dependencies
```sh
bun install
```

### Build the Extension
```sh
bun run build
```

### Watch Mode
You can also use watch mode to automatically rebuild on changes:
```sh
bun run watch
```

### Load the Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode" (toggle in the top right corner).
3. Click "Load unpacked" and select the `dist` folder.

## Contributing
Pull requests are welcome! If you have any ideas or improvements, feel free to open an issue.

## License
This project is licensed under the [MIT License](LICENSE).

