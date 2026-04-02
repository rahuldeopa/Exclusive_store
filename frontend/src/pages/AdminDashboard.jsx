import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, Video, Key } from 'lucide-react';
import api from '../services/api';
import CreateEditModal from '../components/CreateEditModal';
import { useToast } from '../contexts/ToastContext';

const AdminDashboard = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const { addToast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getAdminContent();
            if (response.ok) {
                setContent(response.data.data || []);
            } else {
                addToast('Failed to load content', 'error');
            }
        } catch (error) {
            console.error('Failed to fetch content', error);
            addToast('Network error while fetching content', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this content set?')) return;
        try {
            await api.deleteContent(id);
            addToast('Content deleted successfully', 'success');
            fetchData();
        } catch (error) {
            console.error('Delete failed', error);
            addToast('Failed to delete content', 'error');
        }
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditItem(null);
        setIsModalOpen(true);
    };

    const filteredContent = content.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.accessCode?.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 transition-colors duration-500">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all exclusive content and access codes</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none w-64 transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all transform active:scale-95"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">New Content</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Sets</div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{content.length}</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm transition-colors duration-500">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                        Loading content...
                    </div>
                ) : filteredContent.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        No content found. Create your first content set.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">Content Title</th>
                                    <th className="px-6 py-4">Access Code</th>
                                    <th className="px-6 py-4 text-center">Media Items</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filteredContent.map((item) => (
                                    <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-white">{item.title}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID: {item.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-blue-600 dark:text-indigo-300">
                                                <Key size={12} />
                                                {item.accessCode?.code}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1 font-medium border border-slate-200 dark:border-transparent">
                                                <Video size={14} />
                                                {item.media?.length || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-500 hover:text-blue-700 dark:hover:text-white rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-500 hover:text-red-700 dark:hover:text-white rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CreateEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editData={editItem}
                refreshData={fetchData}
            />
        </div>
    );
};

export default AdminDashboard;
