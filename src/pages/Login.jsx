import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { register } from '../api/authApi.js';

const BOARD = [
  [1,0,2,0,2,0,1,0,1],
  [0,2,0,0,3,0,0,2,0],
  [2,0,1,0,2,0,1,0,2],
  [0,0,0,2,0,2,0,0,0],
  [1,2,0,0,2,0,0,2,1],
];

const CELL_CLASS = { 0:'cell-free', 1:'cell-wall', 2:'cell-block', 3:'cell-bomb' };

function MiniBoard() {
  return (
    <div className="mini-board">
      {BOARD.map((row, r) =>
        row.map((cell, c) => (
          <div key={`${r}-${c}`} className={`mini-cell ${CELL_CLASS[cell]}`} />
        ))
      )}
    </div>
  );
}

function Login() {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      navigate('/lobby');
    } else {
      setError(result.error || 'Credenciales inválidas');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);
    if (result.id || result.user) {
      setTab('login');
      setPassword('');
      setError('');
    } else {
      setError(result.error || 'Error al registrarse');
    }
  }

  return (
    <div className="auth-layout">
      {/* Izquierda */}
      <div className="auth-left">
        <h1 className="auth-title">BOMBERMAN<br/>ONLINE</h1>
        <p className="auth-subtitle">
          Coloca bombas, destruye bloques y sé el último en pie.<br/>
          Batallas 4v4 en tiempo real en arenas dinámicas.
        </p>
        <MiniBoard />
      </div>

      {/* Derecha */}
      <div className="auth-right">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            ENTRAR
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            REGISTRO
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <label className="form-label">USUARIO</label>
            <input
              className="form-input"
              placeholder="player_one"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <label className="form-label">CONTRASEÑA</label>
            <input
              className="form-input"
              type="password"
              placeholder="········"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div className="form-error">{error}</div>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'CARGANDO...' : '▶ INSERTAR MONEDA'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <label className="form-label">USUARIO</label>
            <input
              className="form-input"
              placeholder="player_one"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <label className="form-label">EMAIL</label>
            <input
              className="form-input"
              type="email"
              placeholder="player@arena.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label className="form-label">CONTRASEÑA</label>
            <input
              className="form-input"
              type="password"
              placeholder="········"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div className="form-error">{error}</div>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'CARGANDO...' : '▶ CREAR CUENTA'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;