import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { connectSocket } from '../realtime/socketClient.js';
import { useNavigate } from 'react-router-dom';

function Lobby() {
  const { token, username, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [status, setStatus] = useState('Conectando...');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setStatus('Conectado al lobby');
      socket.emit('room:list');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setStatus('Desconectado');
    });

    socket.on('room:list', (data) => setRooms(data));

    socket.on('room:created', (room) => {
      setRooms(prev => prev.find(r => r.id === room.id) ? prev : [...prev, room]);
    });

    socket.on('player:joined', ({ room }) => {
      setRooms(prev => prev.map(r => r.id === room.id ? room : r));
      setStatus(`Esperando jugadores (${room.playerCount}/${room.capacity})...`);
    });

    socket.on('player:left', () => {
      socket.emit('room:list');
    });

    socket.on('game:start', ({ roomId }) => {
      navigate(`/game/${roomId}`);
    });

    socket.on('room:error', ({ message }) => {
      setStatus(`Error: ${message}`);
    });

    return () => socket.disconnect();
  }, [token, navigate]);

  function handleCreateRoom() {
    if (!socketRef.current || !roomName.trim()) return;
    socketRef.current.emit('room:create', { name: roomName.trim(), capacity: 4 });
    setRoomName('');
  }

  function handleJoinRoom(roomId) {
    if (!socketRef.current) return;
    socketRef.current.emit('room:join', { roomId });
  }

  return (
    <div className="card" style={{ width: '480px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Lobby</h2>
        <button onClick={logout} style={{ width: 'auto', padding: '0.3rem 0.8rem' }}>Salir</button>
      </div>

      <p style={{ fontSize: '0.9rem', color: connected ? '#4caf50' : '#ff8a65' }}>
        {connected ? `● Conectado como ${username}` : '● Desconectado'}
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Nombre de la sala"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
        />
        <button onClick={handleCreateRoom}>Crear sala</button>
      </div>

      <h3 style={{ marginBottom: '0.5rem' }}>Salas disponibles</h3>

      {rooms.length === 0 ? (
        <p style={{ color: '#8b95a5', fontSize: '0.9rem' }}>No hay salas — crea una.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {rooms.filter(r => r.status === 'waiting').map(room => (
            <li key={room.id} style={{
              background: '#232b3a', borderRadius: '6px', padding: '0.6rem',
              marginBottom: '0.5rem', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>
                {room.name}{' '}
                <span style={{ color: '#8b95a5', fontSize: '0.85rem' }}>
                  ({room.playerCount}/{room.capacity})
                </span>
              </span>
              <button
                onClick={() => handleJoinRoom(room.id)}
                style={{ width: 'auto', padding: '0.3rem 0.8rem' }}
                disabled={room.playerCount >= room.capacity}
              >
                Unirse
              </button>
            </li>
          ))}
        </ul>
      )}

      {status && <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#f2884b' }}>{status}</p>}
    </div>
  );
}

export default Lobby;