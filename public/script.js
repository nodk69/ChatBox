// Connect to WebSocket server
const socket = new WebSocket('ws://localhost:3000');

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
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // If the message is a chat message, append it to the chat
  if (data.type === 'chat') {
    appendMessageToChat(data.message, data.time);
  }
  // If the message is a typing status update, show/hide typing indicator
  else if (data.type === 'typing') {
    showTypingIndicator(data.user);
  }
};

// Function to append a message to the chat box with timestamp
function appendMessageToChat(message, time) {
  const messageDiv = document.createElement('div');
  const timeElement = `<span style="font-size: 12px; color: #888; margin-left: 10px;">${time}</span>`;
  messageDiv.innerHTML = `${message} ${timeElement}`;

  // Append the message div to the chat box
  document.getElementById('chatBox').appendChild(messageDiv);

  // Scroll chat box to the bottom smoothly
  document.getElementById('chatBox').scrollTo({ top: document.getElementById('chatBox').scrollHeight, behavior: 'smooth' });
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
function handleTyping() {
  if (isTyping) return;

  isTyping = true;
  // Notify the server that the user is typing
  socket.send(JSON.stringify({ type: 'typing', user: 'Someone is typing...' }));

  // Clear any previous timeout and set a new one
  clearTimeout(typingTimeout);

  // Stop typing indicator after 3 seconds of inactivity
  typingTimeout = setTimeout(() => {
    isTyping = false;
    socket.send(JSON.stringify({ type: 'typing', user: '' }));
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
