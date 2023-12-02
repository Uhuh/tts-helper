# TTS Helper

TTS Helper is an application designed to help Twitch streamers integrate TTS into their streams to create more unique interactions with their viewers.

## TTS Helper utilities
TTS Helper has a few things built in to make life easier.
* History - This will show the currently playing and all completed or skipped redeems.
* Queue - This will show the currently playing and all soon to play redeems.
* Chat Settings - Twitch Affiliates/Partners get redeems. If you're just starting out on Twitch you don't have access to redeems. This area allows you to setup chat commands for your viewers so they can use it to invoke TTS.
* Captions - If you want captions shown in your OBS (or preferred streaming software) you can create a limited, but customizable captions box to display played TTS redeems.
* Moderation - You can filter out redeems by banning words with this simplistic tool. It handles words and phrases separated by a comma.
* [StreamDeck Plugin](https://marketplace.elgato.com/product/tts-helper-ff8f9b6e-ca8a-42a8-9bbe-b12b900cbd89) - Use the official StreamDeck TTS Helper plugin for some basic buttons.

## Free third party services inside TTS Helper
TTS Helper has a few free to use third party services to help kickstart your TTS adventure.
* StreamElements - StreamElements offers a decent variety of TTS options. It's got a high rate limit, you realistically won't exceed it unless you spam every second.
* TikTok - Offers all the silly TikTok voices. Gracefully hosted by [WeilByte](https://github.com/Weilbyte).
* VTubeStudio - You can hookup a rigged model with VTubeStudio and TTS Helper will make the mouth move when you use the TTSHelperParameters

## Paid third party services inside TTS Helper
TTS Helper supports a number of third party services to make the TTS Helper experience better.

These are all optional to use.
* [Amazon Polly](https://aws.amazon.com/polly/) - A pay as you use TTS service. Fairly cheap and has great response times.
* [ElevenLabs](https://elevenlabs.io/) - Natural sounding voices to give the returned responses a lot more personality. Can be expensive!
* [OpenAI](https://platform.openai.com/docs/overview) - Personalize a ChatGPT model to act as a fictional character for your stream!
* [Azure Speech to Text](https://azure.microsoft.com/en-us/products/ai-services/speech-to-text) - A way for the streamer to communicate with their personalized OpenAI model with their voice!

## Recommended IDE Setup

If you want to make improvements to TTS Helper or fork your own here's the recommended setup:

[VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) + [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template).
