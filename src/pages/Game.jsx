import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useGameSocket } from '../game/useGameSocket.js';
import { GameBoard } from '../game/GameBoard.jsx';

const PLAYER_COLORS = ['p-color-0', 'p-color-1', 'p-color-2', 'p-color-3'];
const CORNER_CLASS  = ['corner-p1', 'corner-p2', 'corner-p3', 'corner-p4'];

function Game() {
  const { roomId } = useParams();
  const { token, username } = useAuth();
  const navigate = useNavigate();

  const { gameState, gameOver, connected, movePlayer, placeBomb } = useGameSocket(token, roomId);

  const currentPlayer = gameState?.players?.find(p => p.username === username);
  const currentUserId = currentPlayer?.userId;

  return (
    <div className="game-layout">
      {/* TOPBAR */}
      <div className="game-topbar">
        <div className="game-map-name">
          MAPA: <span>ARENA PRINCIPAL</span>
        </div>
        <div className="game-live">EN VIVO</div>
      </div>

      {!gameOver ? (
        <div style={{ position: 'relative' }}>
          {/* Corner player badges */}
          {gameState?.players?.map((p, i) => (
            <div key={p.userId} className={CORNER_CLASS[i] || ''} style={{ position: 'absolute', zIndex: 10 }}>
              <div className={`player-token ${PLAYER_COLORS[i]} ${p.username === username ? 'me' : ''}`}
                   style={{ opacity: p.alive ? 1 : 0.3 }}>
                P{i + 1}
              </div>
            </div>
          ))}

          <div className="game-board-wrapper">
            <GameBoard
              gameState={gameState}
              currentUserId={currentUserId}
              onMove={movePlayer}
              onBomb={placeBomb}
            />
          </div>
        </div>
      ) : (
        <div className="gameover-card">
          <div className="gameover-title">
            {gameOver.winnerUsername === 'Empate' ? '¡EMPATE!' : '¡GAME OVER!'}
          </div>
          <div className="gameover-winner">
            {gameOver.winnerUsername === 'Empate'
              ? 'Nadie sobrevivió'
              : `🏆 ${gameOver.winnerUsername} gana`}
          </div>
          {gameOver.winnerUsername === username && (
            <div style={{ color: '#00ff88', fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem', marginBottom: '1rem' }}>
              ¡ERES EL CAMPEÓN!
            </div>
          )}
          <button className="btn-primary" onClick={() => navigate('/lobby')}>
            ▶ VOLVER AL LOBBY
          </button>
        </div>
      )}

      {!gameOver && (
        <div className="controls-hint">
          WASD / ↑↓←→ MOVER · ESPACIO = BOMBA
        </div>
      )}
    </div>
  );
}

export default Game;