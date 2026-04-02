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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex transition-colors duration-500">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-500">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 flex items-center justify-center shadow-md">
                            <Monitor className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Admin<span className="text-blue-600 dark:text-blue-400">Portal</span></span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-slate-700 transition-colors shadow-sm">
                        <Monitor size={18} />
                        <span className="font-medium">Dashboard</span>
                    </a>
                    {/* Add more links here if needed */}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
