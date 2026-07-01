import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4001';

function connectSocket(token) {
  const socket = io(SOCKET_URL, {
    query: { token },
    transports: ['websocket'],
  });

  socket.on('connect_error', (err) => {
    console.error('Error de conexión de socket:', err.message);
  });

  return socket;
}

export { connectSocket };