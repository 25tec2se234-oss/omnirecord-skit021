/**
 * Pehchaan (SKIT021) Centralized API Service
 * Secure, configured client for Node/Express + PostgreSQL backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // If body is FormData, delete Content-Type so browser sets boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
    credentials: 'include' // Sends HttpOnly session cookies
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (!response.ok) {
        throw new ApiError(`HTTP Error ${response.status}: ${response.statusText}`, response.status);
      }
      return response;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMsg, response.status, data.details);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or connection failure
    throw new ApiError(
      error.message || 'Network connection failed. Unable to reach server.',
      0
    );
  }
}

export const api = {
  // Base URL
  baseUrl: API_BASE,

  // Health
  checkHealth: () => request('/health'),

  // Authentication
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
    requestPasswordReset: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
    changePassword: (payload) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(payload) })
  },

  // Institution
  institutions: {
    getCurrent: () => request('/institutions/current'),
    updateCurrent: (data) => request('/institutions/current', { method: 'PATCH', body: JSON.stringify(data) }),
    listMembers: () => request('/institutions/members'),
    inviteMember: (data) => request('/institutions/invite', { method: 'POST', body: JSON.stringify(data) })
  },

  // Departments
  departments: {
    list: () => request('/departments'),
    get: (id) => request(`/departments/${id}`),
    create: (data) => request('/departments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  // Students
  students: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/students${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/students/${id}`),
    create: (data) => request('/students', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/students/${id}`, { method: 'DELETE' })
  },

  // Activities
  activities: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/activities${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/activities/${id}`),
    create: (data) => request('/activities', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/activities/${id}`, { method: 'DELETE' })
  },

  // Participation Records
  records: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/records${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/records/${id}`),
    create: (data) => request('/records', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/records/${id}`, { method: 'DELETE' })
  },

  // Verification Workflow
  verification: {
    getQueues: () => request('/verification/queues'),
    submitReview: (decision) => request('/verification/review', { method: 'POST', body: JSON.stringify(decision) }),
    reopenRecord: (payload) => request('/verification/reopen', { method: 'POST', body: JSON.stringify(payload) })
  },

  // Private Evidence Files
  evidence: {
    upload: (formData) => request('/evidence/upload', { method: 'POST', body: formData }),
    getDownloadUrl: (fileId) => `${API_BASE}/evidence/${fileId}/download`
  },

  // Analytics & Exports
  analytics: {
    getDashboard: () => request('/analytics/dashboard'),
    getExportRecordsUrl: () => `${API_BASE}/analytics/export/records`,
    getExportStudentsUrl: () => `${API_BASE}/analytics/export/students`
  },

  // Notifications
  notifications: {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'POST' })
  },

  // Subscriptions
  subscriptions: {
    getCurrent: () => request('/subscriptions/current')
  }
};

export default api;
