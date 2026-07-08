import { useEffect, useRef, useState, useCallback } from 'react';
import { connectSocket } from '../realtime/socketClient.js';

export function useGameSocket(token, roomId) {
  const socketRef = useRef(null);
  const [gameState, setGameState] = useState(null);  
  const [gameOver, setGameOver] = useState(null);   
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('game:start', ({ state }) => {
      setGameState(state);
    });

    socket.on('player:position', ({ userId, x, y }) => {
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p =>
            p.userId === userId ? { ...p, x, y } : p
          )
        };
      });
    });

    socket.on('bomb:placed', ({ userId, x, y, timer }) => {
      setGameState(prev => {
        if (!prev) return prev;
        const bombs = prev.bombs || [];
        return {
          ...prev,
          bombs: [...bombs, { userId, x, y, timer, placedAt: Date.now() }]
        };
      });
    });

    socket.on('bomb:explode', ({ x, y, cells, eliminated }) => {
      setGameState(prev => {
        if (!prev) return prev;
        const newMap = prev.map.map(row => [...row]);

        cells.forEach(({ x: cx, y: cy }) => {
          if (newMap[cy] && newMap[cy][cx] === 2) {
            newMap[cy][cx] = 0;
          }
        });

        return {
          ...prev,
          map: newMap,
          bombs: (prev.bombs || []).filter(b => !(b.x === x && b.y === y)),
          explosionCells: cells,  // para mostrar la animación
        };
      });

      setTimeout(() => {
        setGameState(prev => prev ? { ...prev, explosionCells: [] } : prev);
      }, 500);
    });

    socket.on('player:eliminated', ({ userId }) => {
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p =>
            p.userId === userId ? { ...p, alive: false } : p
          )
        };
      });
    });

    socket.on('game:over', (result) => {
      setGameOver(result);
    });

    return () => socket.disconnect();
  }, [token, roomId]);

  const movePlayer = useCallback((direction) => {
    socketRef.current?.emit('player:move', {
      direction,
      timestamp: Date.now()
    });
  }, []);

  const placeBomb = useCallback(() => {
    socketRef.current?.emit('bomb:place', {});
  }, []);

  return { gameState, gameOver, connected, movePlayer, placeBomb };
}