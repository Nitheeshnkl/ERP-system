export const initSocketClient = async () => {
  return null;
};

export const subscribeInventoryUpdate = async (handler: (payload: any) => void) => {
  void handler;
  return () => {};
};
