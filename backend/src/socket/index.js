let ioInstance = null;

const initSocket = (server) => {
  // Socket server scaffold is opt-in for production safety.
  const { Server } = require('socket.io');
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL.trim());
  }
  if (process.env.CLIENT_URLS) {
    process.env.CLIENT_URLS
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .forEach((origin) => allowedOrigins.push(origin));
  }

  ioInstance = new Server(server, {
    cors: {
      origin: [...new Set(allowedOrigins)],
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
