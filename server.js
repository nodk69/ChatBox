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
const wss = new WebSocket.Server({
  server,
  verifyClient: (info, done) => {
    const origin = info.origin;
    if (origin === 'http://localhost:3000' || origin === 'https://chatbox-nj7j.onrender.com') {
      done(true);
    } else {
      done(false, 401, 'Unauthorized');
    }
  }
});

// When a WebSocket connection is made
wss.on('connection', (ws) => {
  console.log('A user connected');
  
  // Send a welcome message when a user connects
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Welcome to the chat app!',
    timestamp: new Date().toLocaleTimeString()
  }));

  // When a message is received from the client
  ws.on('message', (message) => {
    try {
      // Parse the incoming message
      let parsedMessage = message;
      if (message instanceof Buffer) {
        parsedMessage = message.toString();
      }
      
      // Try to parse as JSON if it's a string
      if (typeof parsedMessage === 'string') {
        parsedMessage = JSON.parse(parsedMessage);
      }

      // Create the message data
      const messageData = {
        type: 'chat',
        message: parsedMessage.message || parsedMessage,
        sender: 'UserName',
        timestamp: new Date().toLocaleTimeString(),
      };

      // Broadcast to ALL clients including sender
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(messageData));
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // When a user disconnects
  ws.on('close', () => {
    console.log('A user disconnected');
    // Optionally, inform all other clients about this disconnection
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'system',
          message: 'A user has disconnected',
          timestamp: new Date().toLocaleTimeString()
        }));
      }
    });
  });

  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error('WebSocket error: ', error);
    ws.close();  // Optionally close the connection on error
  });
});
