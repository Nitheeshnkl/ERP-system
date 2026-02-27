let ioInstance = null;

const initSocket = (server) => {
  // Socket server scaffold is opt-in for production safety.
  const { Server } = require('socket.io');
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    socket.on('disconnect', () => {});
  });

  return ioInstance;
};

const emitInventoryUpdate = (payload) => {
  if (!ioInstance) return;
  ioInstance.emit('inventory:update', payload);
};

module.exports = {
  initSocket,
  emitInventoryUpdate,
};
