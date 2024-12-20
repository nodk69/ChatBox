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
    if (origin === 'http://localhost:10000' || origin === 'https://chatbox-nj7j.onrender.com') {
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
    // Ensure the message is a string (convert Blob to text if necessary)
    if (message instanceof Buffer) {
      message = message.toString(); // Convert Buffer to string
    }

    console.log('Received message: ' + message);

    // Structure the message with sender info and timestamp
    const messageData = {
      type: 'chat',
      message: message,
      sender: 'UserName',  // You can dynamically insert the actual user name here
      timestamp: new Date().toLocaleTimeString(),
    };

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageData));
      }
    });
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
