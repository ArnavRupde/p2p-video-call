const http = require('http');
const express = require('express');
const {Server} = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

HOST = '0.0.0.0';
PORT = 3000;

app.use(express.static( path.resolve('./public') ));

let waitingUser = null;

app.get("/health", (req,res) => {
    res.send("Status: OK");
});

let rooms = {};

io.on('connection', socket => {
    console.log(`User connected ${socket.id}`);

    socket.on('create-room', (roomId) => {
        // Logic to create a new room
        if(!rooms[roomId]) {
            rooms[roomId] = {
                members: [socket.id],
            };
            // socket.join(roomId);
            socket.emit('room-created', roomId);
            console.log(`Room created: ${roomId}`);

        } else {
            // Room already exists
            socket.emit('room-exists');
        }
    });
    
    socket.on('join-room', (roomId) => {
        // Logic to handle joining an existing room
        const room = rooms[roomId];

        if(!rooms[roomId]) {
            rooms[roomId] = {
                members: [socket.id],
            };
            // socket.join(roomId);
            socket.emit('room-created', roomId);
            console.log(`Room created: ${roomId}`);
        } else if (room && room.members.length == 1) {
            // room.members.push(socket.id);
            // socket.join(roomId);
            console.log("Sending join request to room owner", socket.id);
            io.to(room.members[0]).emit('join-request', socket.id);
        } else {
            // Room is full or does not exist
            socket.emit('room-unavailable');
        }
    });

    socket.on('approve-join-request', (roomId, requesterUserId) => {
        console.log(roomId, requesterUserId);
        const room = rooms[roomId];
    
        if (room) {
            if(room.members[0]==socket.id) {
                room.members.push(requesterUserId);
                // socket.join(roomId);
                io.to(requesterUserId).emit('join-approved');
                console.log(`User ${requesterUserId} approved to join room ${roomId}`);
                io.to(requesterUserId).emit('start-peer-connection', socket.id);
            }
        }
    });
    
    socket.on('offer-request', data => {
        const { fromOffer, to } = data;
        console.log("Forwarding offer request to: "+ to);
        socket.to(to).emit('offer-request', { from: socket.id, offer: fromOffer });
    });

    socket.on('offer-answer', data => {
        const { answere, to } = data;
        console.log("Forwarding offer answer to: "+ to);
        socket.to(to).emit('offer-answer', { from: socket.id, offer: answere });
    });

    socket.on('peer-updated', data => {
        const { candidate, to } = data;
        console.log("Peer updated");
        socket.to(to).emit('peer-updated', { from: socket.id, candidate: candidate });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Handle user disconnection, leave rooms, etc.
      });
});

server.listen(PORT, HOST, () => {
    console.log(`Listening on port: ${PORT}`)
})