// ===========================
// COACH ALEX — AI FITNESS CHATBOT
// script.js
// ===========================

// -------------------------------------------------------
// 1. CONFIGURATION
//    Change the system prompt to customize your chatbot!
// -------------------------------------------------------

const SYSTEM_PROMPT = `
You are Coach Zi, an enthusiastic and supportive AI fitness coach.
Your job is to help users with:
- Workout plans (home, gym, beginner to advanced)
- Nutrition and meal timing tips
- Motivation and building healthy habits
- Form tips and injury prevention

Your tone is energetic, positive, and encouraging — like a real personal trainer who genuinely cares.
Keep responses focused and practical. Use short paragraphs or bullet points for workout plans.
Always end with a short motivating line.

Important: Never give medical diagnoses or replace a real doctor. For injuries, always say "see a physio or doctor first."
`;

// -------------------------------------------------------
// 2. CONVERSATION MEMORY
//    This stores the full chat history so the AI
//    remembers what was said earlier in the conversation.
// -------------------------------------------------------

let conversationHistory = [];

// -------------------------------------------------------
// 3. SEND MESSAGE
//    This runs every time the user hits Send.
// -------------------------------------------------------

async function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();

  // Don't send empty messages
  if (!text) return;

  // Clear the input box
  input.value = '';

  // Show the user's message in the chat
  addMessage('user', text);

  // Save it to conversation history
  conversationHistory.push({ role: 'user', content: text });

  // Show a typing indicator while waiting
  const typingEl = showTyping();

  // Call our secure proxy function (which talks to Claude on the server side)
  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system: SYSTEM_PROMPT,              // Coach Zi's personality
        messages: conversationHistory       // Full chat history
      })
    });

    // Parse the response from the API
    const data = await response.json();

    // Extract the text from the response
    const aiReply = data.content.map(block => block.text || '').join('');

    // Remove the typing indicator
    typingEl.remove();

    // Show Coach Zi's reply
    addMessage('ai', aiReply);

    // Save the reply to history so the AI remembers it
    conversationHistory.push({ role: 'assistant', content: aiReply });

  } catch (error) {
    typingEl.remove();
    addMessage('ai', "Oops! Something went wrong connecting to the AI. Check your API key and try again.");
    console.error('API error:', error);
  }
}

// -------------------------------------------------------
// 4. QUICK SUGGESTIONS
//    Runs when a suggestion button is clicked.
// -------------------------------------------------------

function sendQuick(text) {
  document.getElementById('user-input').value = text;
  sendMessage();
}

// -------------------------------------------------------
// 5. ADD MESSAGE TO CHAT
//    Creates a chat bubble and adds it to the window.
// -------------------------------------------------------

function addMessage(role, text) {
  const chatWindow = document.getElementById('chat-window');

  // Create the message container
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;

  // Add avatar (only for AI messages)
  if (role === 'ai') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = '💪';
    messageDiv.appendChild(avatar);
  }

  // Create the bubble with the message text
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = formatMessage(text);  // Format line breaks nicely

  messageDiv.appendChild(bubble);
  chatWindow.appendChild(messageDiv);

  // Scroll to the bottom so the latest message is visible
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// -------------------------------------------------------
// 6. TYPING INDICATOR
//    Shows animated dots while the AI is "thinking"
// -------------------------------------------------------

function showTyping() {
  const chatWindow = document.getElementById('chat-window');

  const messageDiv = document.createElement('div');
  messageDiv.className = 'message ai';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = '💪';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return messageDiv;
}

// -------------------------------------------------------
// 7. FORMAT MESSAGE TEXT
//    Turns line breaks into proper HTML so the text
//    looks good in the chat bubble.
// -------------------------------------------------------

function formatMessage(text) {
  // Escape HTML first
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Split into lines so we can handle headers/bullets per line
  const lines = safe.split('\n');
  let html = '';
  let inList = false;

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h4>${line.slice(4)}</h4>`;
    } else if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h4>${line.slice(3)}</h4>`;
    } else if (line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h4>${line.slice(2)}</h4>`;
    } else if (line.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${line.slice(2)}</li>`;
    } else if (line === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<br>';
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += line + '<br>';
    }
  }

  if (inList) html += '</ul>';

  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return html;
}
}
}

// -------------------------------------------------------
// 8. KEYBOARD SHORTCUT
//    Press Enter to send a message.
// -------------------------------------------------------

document.getElementById('user-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    sendMessage();
  }
});
