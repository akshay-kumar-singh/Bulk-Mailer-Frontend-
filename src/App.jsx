import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Compose from './pages/Compose';
import Preview from './pages/Preview';
import Dashboard from './pages/Dashboard';
import CampaignDetail from './pages/CampaignDetail';
import AuthCallback from './pages/AuthCallback';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/auth/me?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        handleLogout();
      }
    } catch {
      // Server might be sleeping, keep userId for retry
    }
  };

  const handleLogin = (id) => {
    localStorage.setItem('userId', id);
    setUserId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
    setUser(null);
  };

  if (!userId) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ className: 'toast-custom' }} />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'toast-custom' }} />
      <Router>
        <div className="flex min-h-screen">
          <Sidebar user={user} onLogout={handleLogout} />
          <main className="flex-1 ml-64 p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard userId={userId} />} />
              <Route path="/compose" element={<Compose userId={userId} />} />
              <Route path="/preview" element={<Preview userId={userId} />} />
              <Route path="/campaign/:id" element={<CampaignDetail />} />
              <Route path="/auth/callback" element={<AuthCallback onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
}

export default App;
