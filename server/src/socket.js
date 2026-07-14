const { Server } = require('socket.io');

let io;

function init(httpServer) {
  io = new Server(httpServer, { cors: { origin: '*' } });
  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO no ha sido inicializado');
  return io;
}

module.exports = { init, getIO };
