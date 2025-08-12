import { useAuthCtx } from '../../context/AuthContext';
import LoginForm from '../auth/LoginForm';

export default function Protected({ children }) {
  const { user, ready } = useAuthCtx();
  if (!ready) return <div style={{ padding: 32 }}>Loading...</div>;
  if (!user) return <LoginForm />;
  return children;
}