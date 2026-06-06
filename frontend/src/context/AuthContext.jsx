import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getMe()
      .then(res => setUser(res.data))
      .catch(() => {
        setUser(null);
        clearToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const googleLogin = async ({ uid, email, name, photoURL }) => {
    const res = await authAPI.googleLogin({ uid, email, name, photoURL });
    const { token, user: userData } = res.data;
    if (token) setToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    clearToken();
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
