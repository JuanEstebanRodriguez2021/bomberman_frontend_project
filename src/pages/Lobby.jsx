import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocketContext } from '../context/SocketContext.jsx';

function CreateRoomModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(4);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), capacity });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">+ CREAR SALA</h2>
        <form onSubmit={handleSubmit}>
          <label className="form-label">NOMBRE DE LA SALA</label>
          <input
            className="form-input"
            placeholder="Neon Grid"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
          <label className="form-label">CAPACIDAD</label>
          <select
            className="form-input"
            value={capacity}
            onChange={e => setCapacity(Number(e.target.value))}
            style={{ cursor: 'pointer' }}
          >
            <option value={2}>2 jugadores</option>
            <option value={3}>3 jugadores</option>
            <option value={4}>4 jugadores</option>
          </select>
          <button className="btn-primary" type="submit">▶ CREAR</button>
          <button
            type="button"
            className="btn-secondary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            onClick={onClose}
          >
            CANCELAR
          </button>
        </form>
      </div>
    </div>
  );
}

function Lobby() {
  const { username, logout } = useAuth();
  const {
    connected,
    rooms,
    listRooms,
    createRoom,
    joinRoom,
    startedRoomId,
    resetGame,
  } = useSocketContext();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    if (connected) listRooms();
  }, [connected, listRooms]);


  useEffect(() => {
    if (startedRoomId) {
      navigate(`/game/${startedRoomId}`);
    }
  }, [startedRoomId, navigate]);


  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCreate({ name, capacity }) {
    createRoom(name, capacity);
  }

  function handleJoin(roomId) {
    joinRoom(roomId);
  }

  const waitingRooms = rooms.filter(r => r.status === 'waiting');

  return (
    <>
      {showModal && (
        <CreateRoomModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* NavBar */}
      <nav className="navbar">
        <span className="nav-logo">BOMB<span>ARENA</span></span>
        <button className="nav-link active">LOBBY</button>
        <button className="nav-link" onClick={() => navigate('/profile')}>STATS</button>
        <button className="nav-link" onClick={() => navigate('/metrics')}>METRICS</button>
        <button className="nav-link danger" onClick={logout}>SALIR</button>
      </nav>

      {/* LAYOUT */}
      <div className="lobby-layout">
        {/* MAIN */}
        <div className="lobby-main">
          <div className="lobby-header">
            <h1 className="lobby-title">Lobby</h1>
            <p className="lobby-subtitle">
              Elige una sala o crea la tuya. Partidas en tiempo real.
            </p>
          </div>

          {/* MODO CARDS */}
          <div className="mode-cards">
            <div className="mode-card">
              <div className="mode-card-icon">⚡</div>
              <div className="mode-card-title">PARTIDA RÁPIDA</div>
              <div className="mode-card-desc">Únete a la primera sala</div>
            </div>
            <div className="mode-card">
              <div className="mode-card-icon">★</div>
              <div className="mode-card-title">CLÁSICO 4V4</div>
              <div className="mode-card-desc">Sala con 4 jugadores</div>
            </div>
            <div className="mode-card">
              <div className="mode-card-icon">♥</div>
              <div className="mode-card-title">CON AMIGOS</div>
              <div className="mode-card-desc">Crear sala privada</div>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="lobby-actions">
            <span className="sidebar-label">SALAS DISPONIBLES</span>
            <span className="spacer" />
            <button className="btn-create" onClick={() => setShowModal(true)}>
              + CREAR SALA
            </button>
          </div>

          {/* TABLA DE SALAS */}
          <div className="room-table-header">
            <span>SALA</span>
            <span>MODO</span>
            <span>JUGADORES</span>
            <span>PING</span>
            <span>MAPA</span>
            <span></span>
          </div>

          {waitingRooms.length === 0 ? (
            <div style={{ color: '#8b9dc3', fontSize: '0.8rem', padding: '2rem 1rem' }}>
              No hay salas disponibles — crea una para empezar.
            </div>
          ) : (
            waitingRooms.map(room => {
              const full = room.playerCount >= room.capacity;
              return (
                <div className="room-row" key={room.id}>
                  <span className="room-name">
                    <span className="room-name-star">✦</span>
                    {room.name}
                  </span>
                  <span className="room-mode">Clásico {room.capacity}v{room.capacity}</span>
                  <span className={`room-players ${full ? 'full' : 'ok'}`}>
                    {room.playerCount}/{room.capacity}
                  </span>
                  <span className="room-ping">—</span>
                  <span className="room-map">Arena</span>
                  {full ? (
                    <span className="tag-full">LLENA</span>
                  ) : (
                    <button className="btn-enter" onClick={() => handleJoin(room.id)}>
                      ENTRAR
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* SIDEBAR */}
        <div className="lobby-sidebar">
          {/* PERFIL */}
          <div className="profile-card">
            <div className="profile-top">
              <div className="profile-avatar">
                {username?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <div className="profile-name">{username?.toUpperCase()}</div>
                <div className="profile-sub">Jugador activo</div>
              </div>
            </div>
          </div>

          {/* ESTADO CONEXIÓN */}
          <div>
            <div className="sidebar-label">ESTADO</div>
            <div style={{ fontSize: '0.8rem', color: connected ? '#00ff88' : '#ff4444' }}>
              <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
              {connected ? 'CONECTADO AL SERVIDOR' : 'SIN CONEXIÓN'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lobby;