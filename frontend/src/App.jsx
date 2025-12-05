import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthErrorModal from './components/AuthErrorModal';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ActivityDetail from './pages/ActivityDetail';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [showAuthError, setShowAuthError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthError = () => {
      setShowAuthError(true);
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  const handleAuthErrorConfirm = () => {
    setShowAuthError(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          element={
            <PrivateRoute>
              <Layout>
                <Outlet />
              </Layout>
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
        </Route>
      </Routes>
      {showAuthError && <AuthErrorModal onConfirm={handleAuthErrorConfirm} />}
    </>
  );
}

export default App;
