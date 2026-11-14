import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const authApi = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.access_token) {
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.access_token) {
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  seedDemoUsers: async () => {
    const res = await api.post('/auth/seed-demo-users');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
};

// Documents & Metadata APIs
export const documentApi = {
  list: async (params = {}) => {
    const res = await api.get('/documents', { params });
    return res.data;
  },

  getStats: async () => {
    const res = await api.get('/documents/stats/overview');
    return res.data;
  },

  getLogs: async (limit = 20) => {
    const res = await api.get('/documents/access-logs/all', { params: { limit } });
    return res.data;
  },

  upload: async (formData, onProgress) => {
    const res = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res.data;
  },

  download: async (documentId, filename) => {
    const res = await api.get(`/files/download/${documentId}`, {
      responseType: 'blob',
    });
    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'document.pdf');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  delete: async (documentId) => {
    const res = await api.delete(`/files/${documentId}`);
    return res.data;
  }
};

// Cluster & Placement Telemetry APIs
export const clusterApi = {
  getTopology: async () => {
    const res = await api.get('/cluster/topology');
    return res.data;
  },

  setStrategy: async (strategy) => {
    const res = await api.post(`/cluster/strategy?strategy=${encodeURIComponent(strategy)}`);
    return res.data;
  }
};

export default api;
