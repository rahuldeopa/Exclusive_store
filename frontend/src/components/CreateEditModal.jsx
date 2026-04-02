import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Video, Music, Link, Save, Loader2, UploadCloud, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const CreateEditModal = ({ isOpen, onClose, editData, refreshData }) => {
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        code: '',
        expiresAt: '',
        content: {
            title: '',
            type: 'MUSIC',
            media: []
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                // Populate form for editing
                setFormData({
                    code: editData.accessCode?.code || '',
                    expiresAt: editData.accessCode?.expiresAt ? new Date(editData.accessCode.expiresAt).toISOString().split('t')[0] : '',
                    // Note: Backend might not allow editing Code/ExpiresAt easily in updateContent pending implementation
                    // But for now let's focus on Title and Media which we know updateContent supports
                    content: {
                        title: editData.title || '',
                        media: editData.media?.map(m => ({
                            type: m.type,
                            source: m.source,
                            title: m.title,
                            description: m.description || '',
                            url: m.source === 'YOUTUBE' ? `https://youtu.be/${m.youtubeId}` : m.source === 'SOUNDCLOUD' ? m.objectKey : m.objectKey,
                            order: m.order || ''
                        })) || [],
                        type: editData.type || 'MUSIC'
                    }
                });
            } else {
                // Reset for creation
                setFormData({
                    code: '',
                    expiresAt: '',
                    content: {
                        title: '',
                        type: 'MUSIC',
                        media: []
                    }
                });
            }
        }
    }, [isOpen, editData]);

    const handleBasicChange = (e) => {
        const { name, value } = e.target;
        if (name === 'title') {
            setFormData(prev => ({
                ...prev,
                content: { ...prev.content, title: value }
            }));
        } else if (name === 'type') {
            setFormData(prev => ({
                ...prev,
                content: { ...prev.content, type: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addMedia = (type, sourceOverride = null) => {
        setFormData(prev => ({
            ...prev,
            content: {
                ...prev.content,
                media: [...prev.content.media, {
                    type,
                    source: sourceOverride || (type === 'VIDEO' ? 'YOUTUBE' : 'R2'),
                    title: '',
                    description: '',
                    url: '',
                    order: ''
                }]
            }
        }));
    };

    const removeMedia = (index) => {
        setFormData(prev => ({
            ...prev,
            content: {
                ...prev.content,
                media: prev.content.media.filter((_, i) => i !== index)
            }
        }));
    };

    const updateMedia = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            content: {
                ...prev.content,
                media: prev.content.media.map((item, i) => {
                    if (i === index) return { ...item, [field]: value };
                    return item;
                })
            }
        }));
    };

    const handleRemoveFile = async (index) => {
        const item = formData.content.media[index];
        if (item.url) {
            try {
                await api.deleteFile(item.url);
            } catch (e) {
                console.error("Failed to delete file from bucket", e);
                // We proceed to remove it from UI anyway
            }
        }
        updateMedia(index, 'url', '');
    };

    const handleFileUpload = async (index, file) => {
        if (!file) return;

        // Update state to show uploading
        updateMedia(index, 'isUploading', true);

        try {
            const response = await api.uploadFile(file);
            if (response.ok && response.data.data?.key) {
                // Set the URL/Key to the returned key
                updateMedia(index, 'url', response.data.data.key);
                updateMedia(index, 'isUploading', false);
                addToast('File uploaded successfully', 'success');
            } else {
                addToast('Upload failed', 'error');
                updateMedia(index, 'isUploading', false);
            }
        } catch (error) {
            console.error(error);
            addToast('Upload error', 'error');
            updateMedia(index, 'isUploading', false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editData) {
                await api.updateContent(editData.id, {
                    title: formData.content.title,
                    type: formData.content.type,
                    media: formData.content.media.map(m => ({
                        type: m.type,
                        source: m.source,
                        title: m.title,
                        youtubeId: m.source === 'YOUTUBE' ? (m.url.split('v=')[1] || m.url.split('/').pop()) : undefined,
                        objectKey: m.source === 'R2' || m.source === 'SOUNDCLOUD' ? m.url : undefined,
                        description: m.description,
                        order: m.order ? parseInt(m.order) : undefined
                    }))
                });
                addToast('Content updated successfully', 'success');
            } else {
                // Ensure order is parsed to int on create as well
                const payload = {
                    ...formData,
                    content: {
                        ...formData.content,
                        media: formData.content.media.map(m => ({
                            ...m,
                            youtubeId: m.source === 'YOUTUBE' ? (m.url.split('v=')[1] || m.url.split('/').pop()) : undefined,
                            order: m.order ? parseInt(m.order) : undefined
                        }))
                    }
                };
                await api.createContent(payload);
                addToast('Content created successfully', 'success');
            }
            refreshData();
            onClose();
        } catch (error) {
            console.error(error);
            addToast('Operation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm overflow-hidden md:overflow-y-auto">
                    <motion.div 
                        initial={{ y: "100%", opacity: 0.5 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="bg-white dark:bg-slate-900 border-t md:border border-slate-200 dark:border-slate-800 rounded-t-3xl md:rounded-2xl w-full max-w-3xl relative shadow-2xl max-h-[90vh] md:max-h-none overflow-y-auto"
                    >
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">
                        {editData ? 'Edit Content Set' : 'Create New Content'}
                    </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Title</label>
                            <input
                                name="title"
                                type="text"
                                value={formData.content.title}
                                onChange={handleBasicChange}
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
                                placeholder="e.g. exclusive-workshop-bundle"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Experience Type</label>
                            <select
                                name="type"
                                value={formData.content.type}
                                onChange={handleBasicChange}
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none appearance-none"
                                required
                            >
                                <option value="MUSIC">Music (Multiple Videos & Audio)</option>
                                <option value="AUDIOBOOK">Audiobook (Chapters with optional Video)</option>
                                <option value="SHORT_FILM">Short Film (Single Cinema Video)</option>
                                <option value="DIGITAL_BOOK">Digital Book (Interactive PDF/EPUB)</option>
                            </select>
                        </div>

                        {!editData && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Access Code</label>
                                    <input
                                        name="code"
                                        type="text"
                                        value={formData.code}
                                        onChange={handleBasicChange}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
                                        placeholder="User Code (e.g. USER-123)"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Expires At (Optional)</label>
                                    <input
                                        name="expiresAt"
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={handleBasicChange}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Media List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Media Content</h3>
                            <div className="flex flex-wrap gap-2">
                                {formData.content.type === 'DIGITAL_BOOK' && (
                                    <button type="button" onClick={() => addMedia('DOCUMENT', 'R2')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                                        <Plus size={14} /> Add Book File (PDF/EPUB)
                                    </button>
                                )}
                                <button type="button" onClick={() => addMedia('VIDEO')} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/20 transition-colors">
                                    <Plus size={14} /> Add Video
                                </button>
                                <button type="button" onClick={() => addMedia('AUDIO')} className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/20 transition-colors">
                                    <Plus size={14} /> Add Audio (Upload)
                                </button>
                                {formData.content.type === 'DIGITAL_BOOK' && (
                                    <button type="button" onClick={() => addMedia('AUDIO', 'SOUNDCLOUD')} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-medium hover:bg-orange-500/20 transition-colors">
                                        <Plus size={14} /> Add SoundCloud
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {formData.content.media.map((item, idx) => (
                                <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeMedia(idx)}
                                        className="absolute top-4 right-4 p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="grid grid-cols-12 gap-4 items-start pr-10">
                                        <div className="col-span-1 pt-3">
                                            {item.type === 'VIDEO' ? <Video size={20} className="text-indigo-400" /> : item.type === 'DOCUMENT' ? <Link size={20} className="text-emerald-400" /> : <Music size={20} className="text-purple-400" />}
                                        </div>

                                        <div className="col-span-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Title</label>
                                                <input
                                                    value={item.title}
                                                    onChange={(e) => updateMedia(idx, 'title', e.target.value)}
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                    placeholder="Media Title"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">
                                                    {item.type === 'VIDEO' ? 'YouTube URL' : item.source === 'SOUNDCLOUD' ? 'SoundCloud URL' : item.type === 'DOCUMENT' ? 'Upload PDF/EPUB' : 'Upload Audio File'}
                                                </label>

                                                {item.type === 'VIDEO' ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={item.url}
                                                            onChange={(e) => updateMedia(idx, 'url', e.target.value)}
                                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                            placeholder={'https://youtube.com/watch?v=...'}
                                                        />
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">YT</div>
                                                        </div>
                                                    </div>
                                                ) : item.source === 'SOUNDCLOUD' ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={item.url}
                                                            onChange={(e) => updateMedia(idx, 'url', e.target.value)}
                                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                            placeholder={'https://soundcloud.com/...'}
                                                        />
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                                            <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">SC</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 items-center">
                                                        <div className="relative flex-1">
                                                            {item.url ? (
                                                                <div className="flex items-center gap-2 w-full bg-gray-900/50 border border-green-500/30 rounded-lg px-3 py-2">
                                                                    <CheckCircle size={16} className="text-green-400" />
                                                                    <span className="text-sm text-gray-300 truncate flex-1">{item.url}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveFile(idx)}
                                                                        className="text-xs text-red-400 hover:text-red-300 underline"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="relative">
                                                                    <input
                                                                        type="file"
                                                                        onChange={(e) => handleFileUpload(idx, e.target.files[0])}
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                        accept={item.type === 'DOCUMENT' ? ".pdf,.epub" : "audio/*"}
                                                                    />
                                                                    <div className={`w-full bg-gray-900 border border-gray-700 border-dashed rounded-lg px-3 py-2 text-sm text-gray-400 flex items-center gap-2 ${item.isUploading ? 'opacity-50' : 'hover:border-indigo-500'}`}>
                                                                        {item.isUploading ? <Loader2 size={16} className="animate-spin text-indigo-400" /> : <UploadCloud size={16} />}
                                                                        {item.isUploading ? 'Uploading...' : `Click to Upload ${item.type === 'DOCUMENT' ? 'Book' : 'Audio'}`}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {formData.content.type === 'DIGITAL_BOOK' && item.type !== 'DOCUMENT' && (
                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Page Number / Chapter Index</label>
                                                    <input
                                                        type="number"
                                                        value={item.order || ''}
                                                        onChange={(e) => updateMedia(idx, 'order', e.target.value)}
                                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                        placeholder="e.g. 5"
                                                    />
                                                </div>
                                            )}

                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">
                                                    {formData.content.type === 'AUDIOBOOK' ? 'Chapters / Timestamps' : 'Description'}
                                                </label>
                                                <textarea
                                                    value={item.description}
                                                    onChange={(e) => updateMedia(idx, 'description', e.target.value)}
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none h-20 resize-none font-mono"
                                                    placeholder={formData.content.type === 'AUDIOBOOK' ? "00:00 Intro\n05:20 Chapter 1..." : "Optional description..."}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formData.content.media.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-xl text-gray-600 text-sm">
                                    No media added yet. Click buttons above to add content.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || formData.content.media.some(m => m.isUploading)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-[0_20px_40px_-10px_rgba(59,130,246,0.5)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={18} />}
                            {editData ? 'Save Changes' : 'Create Content'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
        )}
        </AnimatePresence>
    );
};

export default CreateEditModal;
