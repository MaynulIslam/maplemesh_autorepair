import { createContext, useContext, useEffect, useState } from 'react';
import { login, getMe } from '../api/auth';
import { getToken, setToken, clearToken } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (t) {
      getMe()
        .then(setUser)
        .catch(() => clearToken())
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  const signIn = async (email, password) => {
    const data = await login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const signOut = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthCtx = () => useContext(AuthContext);