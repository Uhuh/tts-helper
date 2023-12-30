import { VStreamWidget } from '../../../../shared/state/vstream/vstream.feature';

export const generateBrowserSource = (widgets: VStreamWidget[]) => {
  /**
   * @TODO
   * Figure out how to handle fade in/out uniquely for each widget individually
   */

  const htmlWidgets = widgets.map(w => {
    let direction = 'column';

    /**
     * If an image/gif is loaded and the user wants to place the text on a specific side.
     * If the user wants to center the text onto the image, we need to absolute position the text.
     */
    switch (w.fontPosition) {
      case 'top':
        direction = 'column-reverse';
        break;
      case 'left':
        direction = 'row-reverse';
        break;
      case 'bottom':
        direction = 'column';
        break;
      case 'right':
        direction = 'row';
        break;
    }

    return `
      <div class="widget" style="flex-direction: ${direction}; left: ${w.xPosition}px; top: ${w.yPosition}px; height: ${w.height}px; width: ${w.width}px; --fade-in-duration: ${w.fadeInDuration}ms; --fade-out-duration: ${w.fadeOutDuration}ms">
        ${w.fileURL ? `<img src="${w.fileURL}">` : ''}
        ${w.soundPath ? `<audio src="${w.soundPath}"></audio>` : ''}
        <span data-duration="${w.duration}" class="${w.trigger}" style="color: ${w.fontColor}; position: ${w.fontPosition === 'center' ? 'absolute' : ''}; font-size: ${w.fontSize}px; color: ${w.fontColor}">${w.customMessage ?? ''}</span>
      </div>
    `;
  }).join(' ');

  return `
    <style>
      body {
        margin: 0;
        width: 100%;
        height: 100%;
        color: white;
        text-shadow: 1px 1px black;
        font-family: "Gill Sans", sans-serif;
      }
      
      .widget {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        position: absolute;
        opacity: 0;
        top: 300px;
        left: 300px;
        transform: translate(-50%, -50%);
      }
      
      img {
        width: 100%;
        height: inherit;
      }
      
      .fade-in {
        animation: fade-in var(--fade-in-duration) forwards;
      }
      
      .fade-out {
        animation: fade-out var(--fade-out-duration) forwards;
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
      ${htmlWidgets}
    </main>
    <script>
      /**
      * @@@@@@@@@@@@@@@@@@@@@@@@@@ HELLO PEEPER @@@@@@@@@@@@@@@@@@@@@@@@@@
      * If you're editting this, that's fine! Just want to help explain some things.
      * This is designed to work with TTS Helper: https://github.com/uhuh/tts-helper
      * 
      * TTS Helper sends the very customized data here, users are able to write customized messages for these alerts.
      * Users don't have to write a message, but it's the main appeal.
      * 
      * As long as the connection string below stays the same we're all good.
      */
    
      // Connect to TTS Helpers Vstream overlay WS
      const connection = 'ws://127.0.0.1:37391';
    
      function connect() {
        let ws = new WebSocket(connection);
    
        ws.onmessage = (data) => {
          const { id, event, eventData } = JSON.parse(data.data);
    
          // If it's not from tts-helper we don't care.
          if (id !== 'tts-helper') return;

          switch(event) {
            case 'new_follower':
              handleFollowerEvent(eventData);
              break;
            case 'subscriptions_gifted': 
              handleSubGiftEvent(eventData);
              break;
            case 'subscription_renewed':
              handleSubRenewEvent(eventData);
              break;
            case 'shower_received':
              handleShowerEvent(eventData);
              break;
            case 'uplifting_chat_sent':
              handleUpLiftEvent(eventData);
              break;
            default:
          }
        };
    
        ws.onopen = () => {
          ws.send(JSON.stringify({
            data: 'Hello TTS Helper from OBS - VStream Overlays!'
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
      
      /**
      * All handler functions below essentially mimic their TTS Helper counterpart.
      * Because I don't want to limit duplicates of events for users, that means we need to
      * iterate over each element with the same event.
      * 
      * Each event, even if the same, can have a different custom message.
      */
      
      function handleFollowerEvent(data) {
        const { username } = data;
        
        const elems = document.getElementsByClassName('new_follower');
        
        for (const elem of elems) {
          const customMessage = elem.innerText;
          
          const parsedText = customMessage
              .replaceAll(/{username}/g, username);
          
          handleElement(parsedText, customMessage, elem);
        }
      }
      
      function handleUpLiftEvent(data) {
        const { username, formatted, text } = data;
        
        const elems = document.getElementsByClassName('uplifting_chat_sent');
        
        for (const elem of elems) {
          const customMessage = elem.innerText;
          
          const parsedText = customMessage
              .replaceAll(/{formatted}/g, formatted)
              .replaceAll(/{text}/g, text)
              .replaceAll(/{username}/g, username);
          
          handleElement(parsedText, customMessage, elem);
        }
      }
      
      function handleSubRenewEvent(data) { 
        const { tier, streakMonth, renewalMonth, text, username } = data;
        
        const elems = document.getElementsByClassName('subscription_renewed');
        
        for (const elem of elems) {
          const customMessage = elem.innerText;
          
          const parsedText = customMessage
            .replaceAll(/{tier}/g, tier)
            .replaceAll(/{streakMonth}/g, streakMonth)
            .replaceAll(/{renewalMonth}/g, renewalMonth)
            .replaceAll(/{text}/g, text)
            .replaceAll(/{username}/g, username);
          
          handleElement(parsedText, customMessage, elem);
        }
      }
      
      function handleSubGiftEvent(data) {
        const { tier, amount, gifter } = data;
        
        const elems = document.getElementsByClassName('subscriptions_gifted');
        
        for (const elem of elems) {
          const customMessage = elem.innerText;
          
          const parsedText = customMessage
              .replaceAll(/{tier}/g, tier)
              .replaceAll(/{amount}/g, amount)
              .replaceAll(/{gifter}/g, gifter);
          
          handleElement(parsedText, customMessage, elem);
        }
      }
      
      function handleShowerEvent(data) {
        const { username, size, title, description } = data;
        
        const elems = document.getElementsByClassName('shower_received');
        
        for (const elem of elems) {
          const customMessage = elem.innerText;
          
          const parsedText = customMessage
            .replaceAll(/{username}/g, username)
            .replaceAll(/{size}/g, size)
            .replaceAll(/{title}/g, title)
            .replaceAll(/{description}/g, description);
          
          handleElement(parsedText, customMessage, elem);
        }
      }
      
      /**
      * Handles keeping the original custom message safe and displaying the parsed text
      * as well as handling the fade in / out of alerts.
      * @param parsedText - The custom message with values
      * @param originalText - The custom message stored inside the span
      * @param elem - The element to display
      */
      function handleElement(parsedText, originalText, elem) {
        // We store the duration of each widget as a data attr.
        const duration = Number(elem.getAttribute('data-duration'));
        const audio = elem.parentElement.querySelector('audio');
        
        elem.innerText = parsedText;
          
        elem.parentElement.classList.remove('fade-out');
        elem.parentElement.classList.add('fade-in');
        
        if (audio) {
          audio.play();
        }
        
        setTimeout(() => {
          elem.parentElement.classList.remove('fade-in');
          elem.parentElement.classList.add('fade-out');
          
          // Hack for now since the fade out will expose the custom message.
          setTimeout(() => elem.innerText = originalText, 300);
        }, duration * 1000);
      }
      
      connect();
    </script>
  `;
};