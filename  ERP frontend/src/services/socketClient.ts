let socketInstance: any = null;

export const initSocketClient = async () => {
  if (import.meta.env.VITE_ENABLE_SOCKET_IO !== 'true') {
    return null;
  }

  if (socketInstance) {
    return socketInstance;
  }

  const { io } = await import('socket.io-client');
  socketInstance = io((import.meta.env.VITE_SOCKET_URL as string) || 'http://localhost:8000', {
    withCredentials: true,
    autoConnect: true,
  });

  return socketInstance;
};

export const subscribeInventoryUpdate = async (handler: (payload: any) => void) => {
  const socket = await initSocketClient();
  if (!socket) return () => {};

  socket.on('inventory:update', handler);
  return () => socket.off('inventory:update', handler);
};
