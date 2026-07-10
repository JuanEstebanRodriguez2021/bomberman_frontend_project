import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { API_URL } from '../api/authApi.js';

function MetricCard({ label, value, color = '#e0e0e0', sub }) {
  return (
    <div className="profile-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '2rem',
        color: color,
        marginBottom: '0.75rem',
      }}>
        {value ?? '—'}
      </div>
      <div className="sidebar-label" style={{ marginBottom: sub ? '0.4rem' : 0 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: '0.7rem', color: '#8b9dc3' }}>{sub}</div>
      )}
    </div>
  );
}

function Metrics() {
  const { token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const navigate = useNavigate();

  function fetchMetrics() {
    fetch(`${API_URL}/metrics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLastUpdate(new Date().toLocaleTimeString('es-CO'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }


  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <>
      <nav className="navbar">
        <span className="nav-logo">BOMB<span>ARENA</span></span>
        <button className="nav-link" onClick={() => navigate('/lobby')}>LOBBY</button>
        <button className="nav-link" onClick={() => navigate('/profile')}>STATS</button>
        <button className="nav-link active">MÉTRICAS</button>
        <button className="nav-link danger" onClick={logout}>SALIR</button>
      </nav>

      <div style={{ padding: '2rem', maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="lobby-title">Panel de Métricas</h1>
          <p className="lobby-subtitle">
            KPIs de negocio y estado del sistema — actualizado cada 5 segundos.
            {lastUpdate && (
              <span style={{ color: '#00ff88', marginLeft: '0.5rem' }}>
                Última actualización: {lastUpdate}
              </span>
            )}
          </p>
        </div>

        {loading ? (
          <div style={{ color: '#8b9dc3', fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem' }}>
            CARGANDO MÉTRICAS...
          </div>
        ) : (
          <>
            {/* KPIs de negocio */}
            <div className="sidebar-label" style={{ marginBottom: '1rem' }}>
              KPIs DE NEGOCIO
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <MetricCard
                label="PARTIDAS HOY"
                value={data?.partidasHoy ?? 0}
                color="#ff9500"
                sub="Meta: >5 por hora"
              />
              <MetricCard
                label="PARTIDAS TOTALES"
                value={data?.partidasTotales ?? 0}
                color="#ff4444"
                sub="Desde el inicio del sistema"
              />
            </div>

            {/* Estado del sistema */}
            <div className="sidebar-label" style={{ marginBottom: '1rem' }}>
              ESTADO DEL SISTEMA
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <MetricCard
                label="DISPONIBILIDAD"
                value=">95%"
                color="#00ff88"
                sub="Objetivo del MVP"
              />
              <MetricCard
                label="LATENCIA OBJETIVO"
                value="<100ms"
                color="#00ccff"
                sub="Por evento de Socket.IO"
              />
            </div>

            {/* Tabla de últimas métricas */}
            <div className="sidebar-label" style={{ marginBottom: '1rem' }}>
              DETALLE DE MÉTRICAS
            </div>
            <div className="room-table-header"
              style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
              <span>MÉTRICA</span>
              <span>VALOR</span>
              <span>META</span>
            </div>
            {[
              { name: 'Partidas completadas hoy',    value: data?.partidasHoy ?? 0,       meta: '>5/hora',  ok: (data?.partidasHoy ?? 0) >= 5 },
              { name: 'Total partidas en el sistema', value: data?.partidasTotales ?? 0,   meta: 'Creciente', ok: true },
              { name: 'Latencia promedio (objetivo)', value: '<100ms',                     meta: '<100ms',   ok: true },
              { name: 'Disponibilidad (objetivo)',    value: '>95%',                       meta: '>95%',     ok: true },
            ].map((row, i) => (
              <div
                key={i}
                className="room-row"
                style={{ gridTemplateColumns: '2fr 1fr 1fr' }}
              >
                <span className="room-name">
                  <span className="room-name-star">✦</span>
                  {row.name}
                </span>
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.55rem',
                  color: row.ok ? '#00ff88' : '#ff4444'
                }}>
                  {row.value}
                </span>
                <span className="room-mode">{row.meta}</span>
              </div>
            ))}

            {/* Timestamp */}
            <div style={{
              marginTop: '2rem',
              fontSize: '0.7rem',
              color: '#8b9dc3',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '1rem'
            }}>
              Último timestamp del servidor: {data?.timestamp
                ? new Date(data.timestamp).toLocaleString('es-CO')
                : '—'}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Metrics;