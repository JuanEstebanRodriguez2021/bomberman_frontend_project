import { useSocketContext } from '../context/SocketContext.jsx';

export function useGameSocket() {
  const { connected, gameState, gameOver, movePlayer, placeBomb } = useSocketContext();
  return { gameState, gameOver, connected, movePlayer, placeBomb };
}