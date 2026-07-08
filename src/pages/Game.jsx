import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useGameSocket } from '../game/useGameSocket.js';
import { GameBoard } from '../game/GameBoard.jsx';

function Game() {
  const { roomId } = useParams();
  const { token, username } = useAuth();
  const navigate = useNavigate();

  const { gameState, gameOver, connected, movePlayer, placeBomb } = useGameSocket(token, roomId);
  const currentPlayer = gameState?.players?.find(p => p.username === username);
  const currentUserId = currentPlayer?.userId;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#14171c',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <h2 style={{ color: '#e8590c', margin: 0 }}>Bomberman Online</h2>
        <span style={{ color: connected ? '#22c55e' : '#ff8a65', fontSize: 12 }}>
          {connected ? '● Conectado' : '● Desconectado'}
        </span>
      </div>

      {/* Panel de jugadores */}
      {gameState?.players && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          {gameState.players.map((p, i) => (
            <div key={p.userId} style={{
              padding: '4px 12px',
              borderRadius: 6,
              background: p.alive ? '#1b2330' : '#2a1a1a',
              border: p.username === username ? '1px solid #e8590c' : '1px solid #303a4a',
              color: p.alive ? '#fafaf8' : '#555',
              fontSize: 13,
              textDecoration: p.alive ? 'none' : 'line-through',
            }}>
              {p.username} {p.username === username && '(tú)'}
            </div>
          ))}
        </div>
      )}

      {/* Tablero */}
      {!gameOver ? (
        <GameBoard
          gameState={gameState}
          currentUserId={currentUserId}
          onMove={movePlayer}
          onBomb={placeBomb}
        />
      ) : (
        
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>{gameOver.winnerUsername === 'Empate' ? '¡Empate!' : `¡${gameOver.winnerUsername} gana!`}</h2>
          <p style={{ color: '#8b95a5' }}>
            {gameOver.winnerUsername === username ? '🏆 ¡Ganaste!' : 'Para la próxima vez.'}
          </p>
          <button onClick={() => navigate('/lobby')}>Volver al Lobby</button>
        </div>
      )}
    </div>
  );
}

export default Game;