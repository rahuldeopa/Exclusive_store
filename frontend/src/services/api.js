/**
 * API Service
 * Centralized service for all API calls and data management
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';

/**
 * Generic fetch wrapper with error handling
 */
const fetchWrapper = async (endpoint, options = {}) => {
  // Handle FormData separately or check if body is FormData
  const isFormData = options.body instanceof FormData;
  
  const headers = {
     Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
     ...(options.headers || {}),
  };

  if (!isFormData) {
      headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  const data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};


/**
 * Validate passcode
 */
export const validatePasscode = async (passcode) => {
  const response = await fetchWrapper('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ passcode }),
  });

  return response;
};


/**
 * Get media content (videos and audio)
 */
export const getMediaContent = async () => {
  try {
    // Placeholder for actual API call
    // return await fetchWrapper('/media');
    
    return {
      videos: [
        { id: 1, title: 'Video 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 2, title: 'Video 2', url: 'https://www.youtube.com/embed/9bZkp7q19f0' },
      ],
      audio: [
        { id: 1, title: 'Audio Track 1', url: '/audio/track1.mp3' },
        { id: 2, title: 'Audio Track 2', url: '/audio/track2.mp3' },
      ],
    };
  } catch (error) {
    console.error('Failed to fetch media content:', error);
    throw error;
  }
};

/**
 * Health check
 */
// --- Admin APIs ---

export const adminLogin = async (username, password) => {
  return await fetchWrapper('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

export const getAdminContent = async () => {
  return await fetchWrapper('/api/admin/content');
};

export const deleteContent = async (id) => {
  return await fetchWrapper(`/api/admin/content/${id}`, {
    method: 'DELETE',
  });
};

export const updateContent = async (id, data) => {
  return await fetchWrapper(`/api/admin/content/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteFile = async (key) => {
    return await fetchWrapper('/api/upload', {
        method: 'DELETE',
        body: JSON.stringify({ key })
    });
};

export const createContent = async (data) => {
    return await fetchWrapper('/api/content/create', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return await fetchWrapper('/api/upload', {
        method: 'POST',
        body: formData
    });
};

export const healthCheck = async () => {
  try {
    return await fetchWrapper('/health');
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
};

export default {
  validatePasscode,
  getMediaContent,
  healthCheck,
  adminLogin,
  getAdminContent,
  deleteContent,
  updateContent,
  createContent,
  uploadFile,
  deleteFile,
};
