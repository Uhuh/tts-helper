# TTS Helper

TTS Helper is a local-first desktop app for Twitch streamers who want a simple TTS queue console.

## What It Does

- Runs as an Electron desktop app built with React, TypeScript, Vite, and electron-builder.
- Stores queues, queue items, settings, logs, stream session references, Discord webhook jobs, and audio references in SQLite.
- Stores generated Streamlabs TTS audio files locally in the app data directory.
- Supports multiple soft-deletable queues. The fixed `Default` queue always exists and cannot be removed.
- Lets actions target either the `Default` queue or a specific queue.
- Schedules playback by queue priority and each queue's selected item ordering mode: FIFO, LIFO, or item priority.
- Exposes local playback actions for StreamDeck and local HTTP callers.
- Serves an OBS browser source for captions at `http://127.0.0.1:12589/obs/captions`.
- Tracks OBS stream time on playback start and delays Discord webhook posting until the matching Twitch VOD is available.
- Opens Twitch device-code authorization from the desktop app, avoiding local redirect URL setup.

## Retained Integrations

- Twitch chat command and channel-point redeem TTS.
- Twitch OAuth through the desktop app using Twitch's device-code flow.
- Streamlabs TTS generation.
- OBS websocket stream timestamp lookup.
- Discord webhook posting with Twitch VOD timestamp links.
- StreamDeck websocket actions: pause/resume, stop current, skip current, and play next.

## Removed From The Simplified App

Angular, Tauri, Rust plugins, TikTok voices, VTubeStudio/VMC, Amazon Polly, ElevenLabs, OpenAI, Azure STT/TTS, TTS Monster, YouTube, and VStream-specific surfaces are intentionally removed.

## Scripts

```bash
npm install
npm test
npm run build
npm run dist
```

The packaged desktop output is written to `release/`.

## Twitch OAuth

No redirect URL is required. In TTS Helper, enter the Twitch app's Client ID in the Twitch view and use Connect Twitch. The app opens Twitch's activation page, shows the user code, polls Twitch for the token, validates it, and stores it locally.
