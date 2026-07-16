import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { connectSocket } from '../realtime/socketClient.js';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

function SocketProvider({ children }) {
  const { token } = useAuth();
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [gameOver, setGameOver] = useState(null);
  const [startedRoomId, setStartedRoomId] = useState(null);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('room:list', data => setRooms(data));

    socket.on('room:created', room => {
      setRooms(prev => (prev.find(r => r.id === room.id) ? prev : [...prev, room]));
    });

    socket.on('player:joined', ({ room }) => {
      setRooms(prev => prev.map(r => (r.id === room.id ? room : r)));
    });

    socket.on('player:left', () => socket.emit('room:list'));

    socket.on('game:start', ({ roomId, state }) => {
      setGameState(state);
      setGameOver(null);
      setStartedRoomId(roomId);
    });

    socket.on('player:position', ({ userId, x, y }) => {
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => (p.userId === userId ? { ...p, x, y } : p)),
        };
      });
    });

    socket.on('bomb:placed', ({ userId, x, y, timer }) => {
      setGameState(prev => {
        if (!prev) return prev;
        const bombs = prev.bombs || [];
        return { ...prev, bombs: [...bombs, { userId, x, y, timer, placedAt: Date.now() }] };
      });
    });

    socket.on('bomb:explode', ({ x, y, cells, eliminated }) => {
      setGameState(prev => {
        if (!prev) return prev;
        const newMap = prev.map.map(row => [...row]);
        cells.forEach(({ x: cx, y: cy }) => {
          if (newMap[cy] && newMap[cy][cx] === 2) newMap[cy][cx] = 0;
        });
        return {
          ...prev,
          map: newMap,
          bombs: (prev.bombs || []).filter(b => !(b.x === x && b.y === y)),
          explosionCells: cells,
        };
      });

      setTimeout(() => {
        setGameState(prev => (prev ? { ...prev, explosionCells: [] } : prev));
      }, 500);
    });

    socket.on('player:eliminated', ({ userId }) => {
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => (p.userId === userId ? { ...p, alive: false } : p)),
        };
      });
    });

    socket.on('game:over', result => setGameOver(result));

    socket.on('room:error', ({ message }) => alert(message));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const emit = useCallback((event, payload) => {
    socketRef.current?.emit(event, payload);
  }, []);

  const listRooms = useCallback(() => emit('room:list'), [emit]);
  const createRoom = useCallback((name, capacity) => emit('room:create', { name, capacity }), [emit]);
  const joinRoom = useCallback(roomId => emit('room:join', { roomId }), [emit]);
  const movePlayer = useCallback(
    direction => emit('player:move', { direction, timestamp: Date.now() }),
    [emit]
  );
  const placeBomb = useCallback(() => emit('bomb:place', {}), [emit]);


  const resetGame = useCallback(() => {
    setGameState(null);
    setGameOver(null);
    setStartedRoomId(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        connected,
        rooms,
        gameState,
        gameOver,
        startedRoomId,
        listRooms,
        createRoom,
        joinRoom,
        movePlayer,
        placeBomb,
        resetGame,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

function useSocketContext() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext debe usarse dentro de SocketProvider');
  return ctx;
}

export { SocketProvider, useSocketContext };