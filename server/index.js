const express = require('express')
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
const port = 5000;

const connectedUsers = new Map();

const joinToRoom = (room, user) => {
    if (!connectedUsers.has(room)) {
        connectedUsers.set(room, []);
    }
    connectedUsers.get(room).push(user);
}

const leaveRoom = (room, user) => {
    let userList = connectedUsers.get(room);
    userList = userList.filter(u => u !== user);
    if (!userList.length)
        connectedUsers.delete(room);
    else
        connectedUsers.set(room, userList);
}


io.on("connection", socket => {
    
    const room = socket.handshake.query.room
    const user = socket.handshake.query.username
    
    socket.broadcast.to(room).emit('user-joined', { type: 'joined', text: `${user} has joined.`})
    socket.join(room)
    joinToRoom(room, user)
    io.in(room).emit('usersList', {
        room: room,
        users: connectedUsers.get(room)
    });

    socket.on('code-send', msg => {
        socket.broadcast.to(room).emit('code-receive', msg)
    })

    socket.on('lang-send', msg => {
        socket.broadcast.to(room).emit('lang-receive', msg)
    })

    socket.on('message-send', msg => {
        io.in(room).emit('message-receive', msg)
    })

    socket.on('disconnect', () => {
        leaveRoom(room, user)
        socket.broadcast.to(room).emit('user-left', { type: 'left', text: `${user} has left.`})
        io.in(room).emit('usersList', {
            room: room,
            users: connectedUsers.get(room)
        });
        socket.disconnect()
    });

});

httpServer.listen(port, () => {
    console.log('server starting at port ',port)
});