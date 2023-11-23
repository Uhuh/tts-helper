export type PixelString = `${string}px`;
export type BorderString = `${PixelString} ${'solid' | 'dotted'} ${string}`;
export type RGBAString = `rgba(${number}, ${number}, ${number}, ${number})`;

export interface CaptionsInfo {
  fontSize: PixelString;
  fontColor: RGBAString;
  border: BorderString;
  borderRadius: PixelString;
  backgroundColor: RGBAString;
  padding: string;
}

export const captionsGenerator = (info: CaptionsInfo) => {
  return `
    <style>
      .captions-container {
        display: flex;
        opacity: 0;
        width: fit-content;
        background-color: ${info.backgroundColor};
        border: ${info.border};
        padding: ${info.padding};
        border-radius: ${info.borderRadius};
        color: ${info.fontColor};
        font-size: ${info.fontSize};
        font-family: "Gill Sans", sans-serif;
      }
      
      .fade-in {
        animation: fade-in 0.2s forwards;
      }
      
      .fade-out {
        animation: fade-out 0.2s forwards;
      }
      
      @keyframes fade-in {
        0% {
          opacity: 0;
          transform: scale(0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
    
      @keyframes fade-out {
        0% {
          opacity: 1;
          transform: scale(1);
        }
        100% {
          opacity: 0;
          transform: scale(0.9);
        }
      }
    </style>
    <main>
      <div id="tts-helper-text" class="captions-container">
      </div>
    </main>
    <script>
      const textElem = document.getElementById('tts-helper-text');
      const connection = 'ws://127.0.0.1:37891';
      function connect() {
        let ws = new WebSocket(connection);
    
        ws.onmessage = (data) => {
          const { id, event, text } = JSON.parse(data.data);
    
          // If it's not from tts-helper we don't care.
          if (id !== 'tts-helper') return;
    
          if (text) {
            textElem.innerText = text;
          }
    
          switch(event) {
            case 'add-captions':
              textElem.classList.remove('fade-out');
              textElem.classList.add('fade-in');
              break;
            case 'remove-captions':
            default:
              textElem.classList.remove('fade-in');
              textElem.classList.add('fade-out');
          }
        };
    
        ws.onopen = () => {
          ws.send(JSON.stringify({
            data: 'Hello TTS Helper from OBS!'
          }));
        };
    
        let reconnecting = false;
    
        ws.onclose = () => {
          if (reconnecting) {
            return;
          }
    
          console.info('Attempting a reconnect');
    
          reconnecting = true;
    
          setTimeout(() => {
            connect();
            reconnecting = false;
          }, 3000);
        };
    
        ws.onerror = () => {
          if (reconnecting) {
            return;
          }
    
          console.info('Attempting a reconnect');
    
          reconnecting = true;
    
          setTimeout(() => {
            connect();
            reconnecting = false;
          }, 3000);
        };
      }
      
      connect();
    </script>
  `;
};