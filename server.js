// server.js
const WebSocket = require('ws');
const express = require('express');
const path = require('path');

// Create an Express app
const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// When a WebSocket connection is made
wss.on('connection', (ws) => {
  console.log('A user connected');
  
  // Send a welcome message when a user connects
  ws.send('Welcome to the chat app!');

  // When a message is received from the client
  ws.on('message', (message) => {
    // Ensure the message is a string (convert Blob to text if necessary)
    if (message instanceof Buffer) {
      message = message.toString(); // Convert Buffer to string
    }

    console.log('Received message: ' + message);

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);  // Send text message to other clients
      }
    });
  });

  // When a user disconnects
  ws.on('close', () => {
    console.log('A user disconnected');
  });
});
