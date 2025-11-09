// Chat functionality with Gemini API
import { db, auth } from './firebase.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

class ChatManager {
  constructor(chatContainerId, inputId, sendButtonId) {
    this.chatContainer = document.getElementById(chatContainerId);
    this.messageInput = document.getElementById(inputId);
    this.sendButton = document.getElementById(sendButtonId);
    this.conversationHistory = [];
    
    this.initEventListeners();
    this.loadChatHistory();
  }

  initEventListeners() {
    if (this.sendButton) {
      this.sendButton.addEventListener('click', () => this.sendMessage());
    }
    
    if (this.messageInput) {
      this.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
  }

  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;

    // Clear input
    this.messageInput.value = '';

    // Display user message
    this.displayMessage(message, 'user');

    // Save to Firestore
    await this.saveMessage(message, 'user');

    // Get AI response
    await this.getGeminiResponse(message);
  }

  async getGeminiResponse(userMessage) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI interview assistant for PraeHire. Help users prepare for interviews by asking relevant questions and providing feedback. User message: ${userMessage}`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        const aiMessage = data.candidates[0].content.parts[0].text;
        this.displayMessage(aiMessage, 'ai');
        await this.saveMessage(aiMessage, 'ai');
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      this.displayMessage(errorMessage, 'ai');
    }
  }

  displayMessage(message, sender) {
    if (!this.chatContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${this.escapeHtml(message)}</p>
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
      </div>
    `;

    this.chatContainer.appendChild(messageDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  async saveMessage(message, sender) {
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'chats'), {
        userId: auth.currentUser.uid,
        message: message,
        sender: sender,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  loadChatHistory() {
    if (!auth.currentUser || !this.chatContainer) return;

    const q = query(
      collection(db, 'chats'),
      orderBy('timestamp', 'asc')
    );

    onSnapshot(q, (snapshot) => {
      this.chatContainer.innerHTML = '';
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === auth.currentUser.uid) {
          this.displayMessage(data.message, data.sender);
        }
      });
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in other modules
export { ChatManager };

// Auto-initialize if elements exist
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      window.chatManager = new ChatManager('chatContainer', 'messageInput', 'sendButton');
    }
  });
}
