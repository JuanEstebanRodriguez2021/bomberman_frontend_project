import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { API_URL } from '../api/authApi.js';

function Profile() {
  const { token, username, logout } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/profile/games`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setGames(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  return (
    <>
      <nav className="navbar">
        <span className="nav-logo">BOMB<span>ARENA</span></span>
        <button className="nav-link" onClick={() => navigate('/lobby')}>LOBBY</button>
        <button className="nav-link active">STATS</button>
        <button className="nav-link danger" onClick={logout}>SALIR</button>
      </nav>

      <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
        {/* Perfil */}
        <div className="profile-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="profile-avatar" style={{ width: 64, height: 64, fontSize: '1rem' }}>
            {username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="profile-name" style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              {username?.toUpperCase()}
            </div>
            <div className="profile-sub">Jugador activo</div>
          </div>
        </div>

        {/* Historial */}
        <div className="sidebar-label" style={{ marginBottom: '1rem' }}>
          HISTORIAL DE PARTIDAS
        </div>

        {loading ? (
          <div style={{ color: '#8b9dc3', fontSize: '0.8rem' }}>Cargando...</div>
        ) : games.length === 0 ? (
          <div style={{ color: '#8b9dc3', fontSize: '0.8rem', padding: '1rem 0' }}>
            Aún no has jugado ninguna partida.
          </div>
        ) : (
          <>
            <div className="room-table-header" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <span>SALA</span>
              <span>RESULTADO</span>
              <span>FECHA</span>
            </div>
            {games.map(g => (
              <div
                key={g.id}
                className="room-row"
                style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
              >
                <span className="room-name">
                  <span className="room-name-star">✦</span>
                  {g.roomId.substring(0, 16)}...
                </span>
                <span style={{
                  color: '#00ff88',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.5rem'
                }}>
                  {g.result}
                </span>
                <span className="room-mode">
                  {new Date(g.finishedAt).toLocaleDateString('es-CO', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default Profile;