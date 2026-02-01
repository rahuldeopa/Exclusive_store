import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Monitor, LogOut } from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token && location.pathname !== '/admin/login') {
            navigate('/admin/login');
        }
    }, [navigate, location]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    // If on login page, render only the content (Outlet) without sidebar/header
    if (location.pathname === '/admin/login') {
        return <Outlet />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <Monitor className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Admin<span className="text-indigo-400">Portal</span></span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-gray-700/50 text-indigo-300 rounded-lg border border-gray-700 transition-colors">
                        <Monitor size={18} />
                        <span className="font-medium">Dashboard</span>
                    </a>
                    {/* Add more links here if needed */}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-900">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
