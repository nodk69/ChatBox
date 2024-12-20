// Determine WebSocket URL based on the environment
const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'ws://localhost:10000'  // Local development URL
  : 'wss://chatbox-nj7j.onrender.com';  // Production URL

const socket = new WebSocket(socketUrl);

// DOM elements
const messageInput = document.getElementById('messageInput');
const chatBox = document.getElementById('chatBox');
const typingIndicator = document.getElementById('typingIndicator');
const sendButton = document.querySelector('button');

// Variables for managing typing indicator and WebSocket
let typingTimeout;
let isTyping = false;

// Event listener when WebSocket connection is established
socket.onopen = () => {
  console.log('Connected to the WebSocket server');
};

// Handle incoming WebSocket messages
// Handle incoming WebSocket messages
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // Handle chat messages
  if (data.type === 'chat') {
    appendMessageToChat(data.message, data.time);
  }

  // Handle typing status messages
  else if (data.type === 'typing') {
    if (data.user && data.user !== '') {
      showTypingIndicator(data.user); // Show typing indicator if user is typing
    } else {
      typingIndicator.textContent = ''; // Clear typing indicator when empty
    }
  }
};

// Function to append a message to the chat box with timestamp
function appendMessageToChat(message, time) {
  // Check if the message or time is undefined or null
  if (!message || !time) {
    console.error('Invalid message data:', message, time);
    return;
  }

  const messageDiv = document.createElement('div');
  const timeElement = `<span style="font-size: 12px; color: #888; margin-left: 10px;">${time}</span>`;
  messageDiv.innerHTML = `${message} ${timeElement}`;

  // Append the message div to the chat box
  chatBox.appendChild(messageDiv);

  // Scroll chat box to the bottom smoothly
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
}

// Function to send a message when user clicks the send button
function sendMessage() {
  const messageText = messageInput.value.trim();
  if (messageText === "") return;

  const messageTime = new Date().toLocaleTimeString(); // Get current time

  // Create message element
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", "sender");

  const messageTextElement = document.createElement("div");
  messageTextElement.classList.add("text");
  messageTextElement.innerText = messageText;

  messageElement.appendChild(messageTextElement);
  chatBox.appendChild(messageElement);

  // Send message via WebSocket
  socket.send(JSON.stringify({ type: 'chat', message: messageText, time: messageTime }));

  // Scroll to the bottom
  chatBox.scrollTop = chatBox.scrollHeight;

  // Clear the input field
  messageInput.value = "";
  messageInput.focus();
}

// Function to handle typing indicator when user is typing
// Update this function to handle typing with user information
function handleTyping() {
  if (isTyping) return;

  isTyping = true;
  // Replace 'someone' with the actual username or identifier if available
  const username = 'User1'; // Example: You can dynamically fetch this
  socket.send(JSON.stringify({ type: 'typing', user: username + ' is typing...' }));

  // Clear any previous timeout and set a new one
  clearTimeout(typingTimeout);

  // Stop typing indicator after 3 seconds of inactivity
  typingTimeout = setTimeout(() => {
    isTyping = false;
    socket.send(JSON.stringify({ type: 'typing', user: '' })); // Send empty string when typing stops
  }, 3000);
}


// Function to show the typing indicator
function showTypingIndicator(user) {
  if (user) {
    typingIndicator.textContent = `${user} is typing...`;
  } else {
    typingIndicator.textContent = ''; // Clear typing indicator when the user stops typing
  }
}

// Attach event listener for input changes (for detecting typing)
messageInput.addEventListener('input', handleTyping);

// Attach event listener for sending message via button
sendButton.addEventListener('click', sendMessage);

// Handle the 'Enter' key to send a message
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent form submission (if in a form)
    sendMessage(); // Trigger send message function
  }
});

// Optional: Receive a message function to display incoming messages
function receiveMessage(receivedText) {
  const messageContainer = document.getElementById("chatBox");

  // Create receiver message element
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", "receiver");

  const messageTextElement = document.createElement("div");
  messageTextElement.classList.add("text");
  messageTextElement.innerText = receivedText;

  messageElement.appendChild(messageTextElement);
  messageContainer.appendChild(messageElement);

  // Scroll to the bottom
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
