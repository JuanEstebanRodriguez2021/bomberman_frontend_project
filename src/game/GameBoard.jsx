import { useEffect } from 'react';

const CELL_SIZE = 40;

const COLORS = {
  0: '#3a3a3a',      // celda libre
  1: '#222222',      // pared
  2: '#7a5c2e',      // bloque destructible
};

const PLAYER_COLORS = ['#e8590c', '#3b82f6', '#22c55e', '#a855f7'];

export function GameBoard({ gameState, currentUserId, onMove, onBomb }) {

  // Captura de teclado
  useEffect(() => {
    function handleKey(e) {
      switch (e.key) {
        case 'ArrowUp':    case 'w': e.preventDefault(); onMove('up'); break;
        case 'ArrowDown':  case 's': e.preventDefault(); onMove('down'); break;
        case 'ArrowLeft':  case 'a': e.preventDefault(); onMove('left'); break;
        case 'ArrowRight': case 'd': e.preventDefault(); onMove('right'); break;
        case ' ':                    e.preventDefault(); onBomb(); break;
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onMove, onBomb]);

  if (!gameState) return <p style={{ color: '#fafaf8' }}>Cargando partida...</p>;

  const { map, players, bombs = [], explosionCells = [] } = gameState;

  const explosionSet = new Set(explosionCells.map(c => `${c.x},${c.y}`));
  const bombSet = new Map((bombs || []).map(b => [`${b.x},${b.y}`, b]));

  return (
    <div style={{ display: 'inline-block', border: '2px solid #e8590c', borderRadius: 4 }}>
      {map.map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex' }}>
          {row.map((cell, colIdx) => {
            const isExplosion = explosionSet.has(`${colIdx},${rowIdx}`);
            const hasBomb = bombSet.has(`${colIdx},${rowIdx}`);
            const playersHere = players.filter(p => p.alive && p.x === colIdx && p.y === rowIdx);

            let bgColor = isExplosion ? '#ff6b00' : COLORS[cell] || '#3a3a3a';

            return (
              <div
                key={colIdx}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: bgColor,
                  border: '1px solid #1a1a1a',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  transition: 'background 0.15s',
                }}
              >
                {hasBomb && !isExplosion && (
                  <span title="Bomba">💣</span>
                )}
                {playersHere.map((p, i) => {
                  const pIndex = players.findIndex(pl => pl.userId === p.userId);
                  const isMe = p.userId === currentUserId;
                  return (
                    <div
                      key={p.userId}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: PLAYER_COLORS[pIndex % PLAYER_COLORS.length],
                        border: isMe ? '2px solid white' : '2px solid transparent',
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: 'white',
                        zIndex: 2,
                      }}
                      title={p.username}
                    >
                      {p.username[0].toUpperCase()}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ padding: '4px 8px', background: '#1b2330', fontSize: 12, color: '#8b95a5' }}>
        WASD / ↑↓←→ mover · Espacio = bomba
      </div>
    </div>
  );
}