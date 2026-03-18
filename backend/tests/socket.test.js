jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
  })),
}));

const { initSocket, emitInventoryUpdate } = require('../src/socket');

describe('Socket scaffold', () => {
  it('initializes server and emits inventory update', () => {
    const server = {};
    const io = initSocket(server);
    expect(io).toBeDefined();

    emitInventoryUpdate({ sku: 'X1' });
    expect(io.emit).toHaveBeenCalledWith('inventory:update', { sku: 'X1' });
  });
});
