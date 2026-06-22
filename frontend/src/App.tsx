import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import Landing from './pages/Landing';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#f5f3f0] dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#f5f3f0] transition-colors duration-500 font-sans">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="login" element={<AdminLogin />} />
                <Route path="dashboard" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <ThemeToggle />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
