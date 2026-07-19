export type RGBAString = `rgba(${number}, ${number}, ${number}, ${number})`;

export interface OnScreenChatConfig {
  fontSize: number;
  maxMessages: number;
  backgroundColor: RGBAString;
  messageColor: RGBAString;
  highlightColor: RGBAString;
  showSourceBadge: boolean;
  filterTwitch: boolean;
  filterYoutube: boolean;
  filterTtsHelper: boolean;
  filterGpt: boolean;
  filterAzure: boolean;
  filterVstream: boolean;
}

export const onScreenChatGenerator = (config: OnScreenChatConfig) => {
  const filters = {
    twitch: config.filterTwitch,
    youtube: config.filterYoutube,
    'tts-helper': config.filterTtsHelper,
    gpt: config.filterGpt,
    azure: config.filterAzure,
    vstream: config.filterVstream,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TTS Helper - On-Screen Chat</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      font-family: "Gill Sans", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background: transparent;
      overflow: hidden;
    }

    .chat-container {
      background-color: ${config.backgroundColor};
      padding: 10px;
      border-radius: 8px;
      height: 100vh;
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .message-item {
      padding: 10px;
      border-radius: 6px;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      background-color: transparent;
      opacity: 0;
      transform: translateY(10px);
      animation: fadeIn 0.4s ease-out forwards;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message-item.show {
      opacity: 1;
      transform: translateY(0);
    }

    .message-item.highlighted {
      background-color: ${config.highlightColor};
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .message-item.is-tts {
      border: 3px solid ${config.highlightColor};
      padding-left: calc(0.75rem - 3px);
      background-color: color-mix(in srgb, ${config.highlightColor} 20%, transparent);
    }

    .message-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
    }

    .username {
      font-weight: bold;
      font-size: ${config.fontSize}px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }

    .source-badge {
      display: ${config.showSourceBadge
    ? 'inline-block'
    : 'none'};
      font-size: ${config.fontSize * 0.75}px;
      padding: 0.2rem 0.5rem;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      width: fit-content;
      color: ${config.messageColor};
      opacity: 0.8;
    }

    .message-text {
      color: ${config.messageColor};
      font-size: ${config.fontSize}px;
      word-wrap: break-word;
      line-height: 1.4;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: ${config.messageColor};
      opacity: 0.5;
      font-size: ${config.fontSize}px;
    }

    .chat-container::-webkit-scrollbar {
      width: 8px;
    }

    .chat-container::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    .chat-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    .chat-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <div class="chat-container" id="chat-container"></div>

  <script>
    const chatContainer = document.getElementById('chat-container');
    const connection = 'ws://127.0.0.1:37891';
    const maxMessages = ${config.maxMessages};
    const filters = ${JSON.stringify(filters)};
    
    let messages = [];
    let currentlyPlayingChatMessageId = null;
    let messageIdCounter = 0;

    const sourceLabels = {
      'twitch': 'Twitch',
      'youtube': 'YouTube',
      'tts-helper': 'TTS Helper',
    };

    function shouldShowSource(source) {
      return filters[source] !== false;
    }

    function getUsernameColor(username) {
      let hash = 0;
      for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const hue = Math.abs(hash % 360);
      const saturation = 60 + (Math.abs(hash) % 20);
      const lightness = 55 + (Math.abs(hash) % 15);
      
      return \`hsl(\${hue}, \${saturation}%, \${lightness}%)\`;
    }

    function createMessageElement(message) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message-item';
      messageDiv.setAttribute('data-id', message.id);
      messageDiv.setAttribute('data-chat-message-id', message.chatMessageId);
      
      if (message.isTTS) {
        messageDiv.classList.add('is-tts');
      }
      
      const messageHeader = document.createElement('div');
      messageHeader.className = 'message-header';
      
      const username = document.createElement('span');
      username.className = 'username';
      username.textContent = message.username;
      username.style.color = getUsernameColor(message.username);
      
      const sourceBadge = document.createElement('span');
      sourceBadge.className = 'source-badge';
      sourceBadge.textContent = sourceLabels[message.source] || message.source;
      
      messageHeader.appendChild(username);
      messageHeader.appendChild(sourceBadge);
      
      const messageText = document.createElement('span');
      messageText.className = 'message-text';
      messageText.textContent = message.text;
      
      messageDiv.appendChild(messageHeader);
      messageDiv.appendChild(messageText);
      
      return messageDiv;
    }

    let renderedMessageIds = new Set();

    function addMessage(message) {
      if (renderedMessageIds.has(message.id)) {
        return;
      }

      const messageEl = createMessageElement(message);
      
      if (message.chatMessageId === currentlyPlayingChatMessageId) {
        messageEl.classList.add('highlighted');
      }
      
      chatContainer.appendChild(messageEl);
      renderedMessageIds.add(message.id);

      chatContainer.scrollTop = chatContainer.scrollHeight;

      const messageElements = chatContainer.querySelectorAll('.message-item');
      if (messageElements.length > maxMessages) {
        const toRemove = messageElements[0];
        const removedId = parseInt(toRemove.getAttribute('data-id'));
        toRemove.remove();
        renderedMessageIds.delete(removedId);
      }
    }

    function updateHighlight() {
      const allMessages = chatContainer.querySelectorAll('.message-item');
      
      allMessages.forEach(el => {
        const chatMessageId = el.getAttribute('data-chat-message-id');
        
        if (chatMessageId && chatMessageId === currentlyPlayingChatMessageId) {
          el.classList.add('highlighted');
        } else {
          el.classList.remove('highlighted');
        }
      });

      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function renderMessages() {
      if (messages.length === 0) {
        chatContainer.innerHTML = '';
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No messages in queue yet...';
        chatContainer.appendChild(emptyState);
        renderedMessageIds = new Set();
        return;
      }

      const emptyState = chatContainer.querySelector('.empty-state');
      if (emptyState) {
        emptyState.remove();
      }

      const filteredMessages = messages
        .filter(msg => shouldShowSource(msg.source))
        .slice(0, maxMessages)
        .reverse();

      filteredMessages.forEach(message => {
        addMessage(message);
      });

      const currentMessageIds = new Set(filteredMessages.map(m => m.id));
      const messageElements = chatContainer.querySelectorAll('.message-item');
      
      messageElements.forEach(el => {
        const messageId = parseInt(el.getAttribute('data-id'));
        if (!currentMessageIds.has(messageId)) {
          el.remove();
          renderedMessageIds.delete(messageId);
        }
      });
    }

    function connect() {
      let ws = new WebSocket(connection);

      ws.onmessage = (data) => {
        const payload = JSON.parse(data.data);
        const { id, event } = payload;

        switch(event) {
          case 'chat-message':
            if (payload.message) {
              const newMessage = {
                id: messageIdCounter++,
                chatMessageId: payload.message.chatMessageId,
                username: payload.message.username,
                text: payload.message.text,
                source: payload.message.source,
                isTTS: payload.message.isTTS,
              };
              messages.unshift(newMessage);
              renderMessages();
            }
            break;
            
          case 'audio-started':
            if (payload.chatMessageId) {
              currentlyPlayingChatMessageId = payload.chatMessageId;

              const message = messages.find(m => m.chatMessageId === payload.chatMessageId);
              if (message && !message.isTTS) {
                message.isTTS = true;
                const el = chatContainer.querySelector(\`[data-chat-message-id="\${payload.chatMessageId}"]\`);
                if (el) {
                  el.classList.add('is-tts');
                }
              }
            }
            updateHighlight();
            break;
            
          case 'audio-finished':
          case 'audio-skipped':
            currentlyPlayingChatMessageId = null;
            updateHighlight();
            break;
            
          case 'audio-queue':
            if (payload.queue) {
              payload.queue.forEach(queueItem => {
                if (queueItem.chatMessageId) {
                  const existingMessage = messages.find(m => m.chatMessageId === queueItem.chatMessageId);
                  
                  if (existingMessage && !existingMessage.isTTS) {
                    existingMessage.isTTS = true;
                    
                    const el = chatContainer.querySelector(\`[data-chat-message-id="\${queueItem.chatMessageId}"]\`);
                    if (el) {
                      el.classList.add('is-tts');
                    }
                  }
                }
              });
            }
            break;
        }
      };

      ws.onopen = () => {
        console.log('Connected to TTS Helper');
        ws.send(JSON.stringify({
          id: 'on-screen-chat',
          data: 'Hello TTS Helper from On-Screen Chat!'
        }));
        
        ws.send(JSON.stringify({
          id: 'on-screen-chat',
          event: 'request-queue'
        }));
      };

      let reconnecting = false;

      ws.onclose = () => {
        if (reconnecting) return;
        
        console.info('Connection closed. Attempting reconnect...');
        reconnecting = true;
        
        setTimeout(() => {
          connect();
          reconnecting = false;
        }, 3000);
      };

      ws.onerror = (error) => {
        if (reconnecting) return;
        
        console.error('WebSocket error:', error);
        console.info('Attempting reconnect...');
        reconnecting = true;
        
        setTimeout(() => {
          connect();
          reconnecting = false;
        }, 3000);
      };
    }

    connect();
  </script>
</body>
</html>`;
};
