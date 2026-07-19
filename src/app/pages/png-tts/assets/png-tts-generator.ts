export type PngTtsAnimation = 'none' | 'jump' | 'shake' | 'bounce' | 'sway';

export interface PngTtsModel {
  name: string;
  extension: string;
  talkAnimation: PngTtsAnimation;
  intensity: number;
  duration: number;
  opacity: number;
  dimness: number;
}

export interface PngTtsConfig {
  models: PngTtsModel[];
}

export const PNG_TTS_MODEL_DEFAULTS = {
  talkAnimation: 'none' as PngTtsAnimation,
  intensity: 1,
  duration: 400,
  opacity: 1,
  dimness: 0,
};

export const createDefaultPngTtsModel = (index: number): PngTtsModel => ({
  name: `Model ${index + 1}`,
  extension: 'png',
  ...PNG_TTS_MODEL_DEFAULTS,
});

export const pngTtsConfigFile = (config: PngTtsConfig) =>
  `window.PNG_TTS_CONFIG = ${JSON.stringify(config, null, 2)};\n`;

export const pngTtsGenerator = (config: PngTtsConfig) => {
  return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>TTS Helper - PNG TTS</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
      
          html, body {
            height: 100%;
            width: 100%;
            background: transparent;
            overflow: hidden;
          }
      
          .stage {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
      
          .layer {
            position: absolute;
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
      
          .not-talking {
            opacity: 1;
          }
      
          .talking {
            opacity: 0;
          }
      
          .stage.talking-active .not-talking {
            opacity: 0;
          }
      
          .stage.talking-active .talking {
            opacity: 1;
          }
      
          ${pngTtsKeyframes()}
      
          .stage.talking-active.anim-jump .talking { animation: png-tts-jump var(--anim-duration, 0.35s) ease-in-out infinite; }
          .stage.talking-active.anim-shake .talking { animation: png-tts-shake var(--anim-duration, 0.25s) ease-in-out infinite; }
          .stage.talking-active.anim-bounce .talking { animation: png-tts-bounce var(--anim-duration, 0.4s) ease-in-out infinite; }
          .stage.talking-active.anim-sway .talking { animation: png-tts-sway var(--anim-duration, 0.9s) ease-in-out infinite; }
        </style>
      </head>
      <body>
        <div id="stage" class="stage">
          <img id="not-talking" class="layer not-talking" alt="">
          <img id="talking" class="layer talking" alt="">
        </div>
      
        <script src="png-tts-config.js"></script>
        <script>
          const BAKED_CONFIG = ${JSON.stringify(config)};
          const config = (window.PNG_TTS_CONFIG && typeof window.PNG_TTS_CONFIG === 'object')
            ? window.PNG_TTS_CONFIG
            : BAKED_CONFIG;
      
          const ANIMATIONS = ['none', 'jump', 'shake', 'bounce', 'sway'];
      
          const models = (config.models || []).map((m, i) => ({
            ...m,
            notTalking: 'no_talk_' + i + '.' + (m.extension || 'png'),
            talking: 'talk_' + i + '.' + (m.extension || 'png'),
          }));
      
          const stage = document.getElementById('stage');
          const notTalkingImg = document.getElementById('not-talking');
          const talkingImg = document.getElementById('talking');
          const connection = 'ws://127.0.0.1:37891';
      
          function applyModel(index) {
            const model = models[index];
            if (!model) {
              return;
            }
      
            notTalkingImg.src = model.notTalking;
            talkingImg.src = model.talking;
      
            const animation = model.talkAnimation ?? 'none';
            const intensity = model.intensity ?? 1;
            const duration = model.duration ?? 400;
            const opacity = model.opacity ?? 1;
            const dimness = model.dimness ?? 0;
      
            stage.style.opacity = opacity;
            stage.style.setProperty('--intensity', intensity);
            stage.style.setProperty('--anim-duration', duration + 'ms');
            notTalkingImg.style.filter = 'brightness(' + (1 - dimness) + ')';
      
            ANIMATIONS.forEach(a => stage.classList.remove('anim-' + a));
            stage.classList.add('anim-' + (ANIMATIONS.includes(animation) ? animation : 'none'));
          }
      
          function setTalking(isTalking) {
            stage.classList.toggle('talking-active', isTalking);
          }
      
          applyModel(0);
      
          function connect() {
            const ws = new WebSocket(connection);
      
            const sendHello = () => {
              ws.send(JSON.stringify({
                id: 'png-tts',
                event: 'png-tts-hello',
                modelCount: models.length,
                modelNames: models.map(m => m.name),
                config: config,
              }));
            };
      
            ws.onmessage = (data) => {
              const payload = JSON.parse(data.data);
              const { event } = payload;
      
              switch (event) {
                case 'audio-started':
                  setTalking(true);
                  break;
                case 'audio-finished':
                case 'audio-skipped':
                  setTalking(false);
                  break;
                case 'png-tts-select-model':
                  if (typeof payload.modelIndex === 'number') {
                    applyModel(payload.modelIndex);
                  }
                  break;
                case 'png-tts-request-hello':
                  sendHello();
                  break;
              }
            };
      
            ws.onopen = sendHello;
      
            let reconnecting = false;
      
            const scheduleReconnect = () => {
              if (reconnecting) return;
              reconnecting = true;
              setTimeout(() => {
                connect();
                reconnecting = false;
              }, 3000);
            };
      
            ws.onclose = scheduleReconnect;
            ws.onerror = scheduleReconnect;
          }
      
          connect();
        </script>
      </body>
      </html>
  `;
};

export const pngTtsKeyframes = () => `
  @keyframes png-tts-jump {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(calc(-8% * var(--intensity, 1))); }
  }

  @keyframes png-tts-shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(calc(-3deg * var(--intensity, 1))); }
    75% { transform: rotate(calc(3deg * var(--intensity, 1))); }
  }

  @keyframes png-tts-bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(calc(1 + 0.08 * var(--intensity, 1))); }
  }

  @keyframes png-tts-sway {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    25% { transform: translateX(calc(-4% * var(--intensity, 1))) rotate(calc(-2deg * var(--intensity, 1))); }
    75% { transform: translateX(calc(4% * var(--intensity, 1))) rotate(calc(2deg * var(--intensity, 1))); }
  }
`;
