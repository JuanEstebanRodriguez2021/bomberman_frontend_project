import { useEffect } from 'react';

const CELL_CLASS = { 0: 'free', 1: 'wall', 2: 'block' };
const PLAYER_COLORS = ['p-color-0', 'p-color-1', 'p-color-2', 'p-color-3'];

export function GameBoard({ gameState, currentUserId, onMove, onBomb }) {

  useEffect(() => {
    function handleKey(e) {
      switch (e.key) {
        case 'ArrowUp':    case 'w': e.preventDefault(); onMove('up');    break;
        case 'ArrowDown':  case 's': e.preventDefault(); onMove('down');  break;
        case 'ArrowLeft':  case 'a': e.preventDefault(); onMove('left');  break;
        case 'ArrowRight': case 'd': e.preventDefault(); onMove('right'); break;
        case ' ':                    e.preventDefault(); onBomb();         break;
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onMove, onBomb]);

  if (!gameState) {
    return (
      <div style={{ color: '#8b9dc3', fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem', padding: '2rem' }}>
        CARGANDO PARTIDA...
      </div>
    );
  }

  const { map, players, bombs = [], explosionCells = [] } = gameState;
  const explosionSet = new Set(explosionCells.map(c => `${c.x},${c.y}`));
  const bombMap = new Map((bombs || []).map(b => [`${b.x},${b.y}`, b]));

  return (
    <div>
      {map.map((row, rowIdx) => (
        <div className="board-row" key={rowIdx}>
          {row.map((cell, colIdx) => {
            const isExplosion = explosionSet.has(`${colIdx},${rowIdx}`);
            const hasBomb = bombMap.has(`${colIdx},${rowIdx}`);
            const playersHere = players.filter(
              p => p.alive && p.x === colIdx && p.y === rowIdx
            );

            let cellClass = isExplosion ? 'explosion' : (CELL_CLASS[cell] || 'free');

            return (
              <div key={colIdx} className={`board-cell ${cellClass}`}>
                {hasBomb && !isExplosion && (
                  <span className="bomb-token">💣</span>
                )}
                {playersHere.map(p => {
                  const pIndex = players.findIndex(pl => pl.userId === p.userId);
                  const isMe = p.userId === currentUserId;
                  return (
                    <div
                      key={p.userId}
                      className={`player-token ${PLAYER_COLORS[pIndex % 4]} ${isMe ? 'me' : ''}`}
                      title={p.username}
                    >
                      P{pIndex + 1}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}