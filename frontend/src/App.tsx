import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout'; // Import the new Layout
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ActivationPage from './pages/ActivationPage';
import GuestbookPage from './pages/GuestbookPage';
import PublicTreePage from './pages/PublicTreePage';
import './App.css';
import { ReactNode } from 'react';

// ProtectedRoute with TypeScript
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* All pages now render inside the Layout's <Outlet> */}
        <Route index element={<HomePage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="activate/:token" element={<ActivationPage />} />
        <Route path="tree/:userId" element={<PublicTreePage />} />
        <Route 
          path="guestbook/:userId" 
          element={
            <ProtectedRoute>
              <GuestbookPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;