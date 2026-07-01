import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi } from '../api/authApi.js';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  async function login(user, password) {
    const result = await loginApi(user, password);

    if (result.token) {
      setToken(result.token);
      setUsername(result.user.username);
      localStorage.setItem('username', result.user.username);
      return { success: true };
    }

    return { success: false, error: result.error };
  }

  function logout() {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('username');
  }

  return (
    <AuthContext.Provider value={{ token, username, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

export { AuthProvider, useAuth };