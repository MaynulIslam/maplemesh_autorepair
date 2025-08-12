import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegisterChoice from './components/auth/RegisterChoice';
import RegisterCustomerForm from './components/auth/RegisterCustomerForm';
import RegisterTechnicianForm from './components/auth/RegisterTechnicianForm';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import { useAuthCtx } from './context/AuthContext';

function Protected({ children }) {
  const { user, ready } = useAuthCtx();
  if (!ready) return <div style={{ padding:40 }}>Loading...</div>;
  if (!user) return <LoginForm />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterChoice />} />
        <Route path="/register/customer" element={<RegisterCustomerForm />} />
        <Route path="/register/technician" element={<RegisterTechnicianForm />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/services" element={<Protected><Services /></Protected>} />
        <Route path="/billing" element={<Protected><Billing /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="*" element={<div style={{ padding:40 }}>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}