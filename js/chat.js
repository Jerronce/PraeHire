// Chat functionality with Gemini API
import { db, auth } from './firebase.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';


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
      const response = await fetch(
        'https://us-central1-praehire.cloudfunctions.net/interviewChat',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({message: userMessage})
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      const aiMessage = data.response;

      if (!aiMessage) {
        throw new Error('No response from AI');
      }

      this.displayMessage(aiMessage, 'ai');
      await this.saveMessage(aiMessage, 'ai');
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = error.message || error.toString() || 'Sorry, I encountered an error';
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

// PAGE PROTECTION - Redirect non-subscribers
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const hasSubscription = await checkSubscriptionStatus();
        if (!hasSubscription) {
            alert('Subscription required to access this feature. Redirecting to dashboard...');
            window.location.href = '/dashboard';
        }
    } else {
        window.location.href = '/login.html';
    }
});
