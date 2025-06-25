// API client for backend communication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export interface ApiResponse<T> {
  success: boolean;
  timestamp: string;
  data?: T;
  error?: string;
}

export interface ChatMessage {
  id: string;
  question: string;
  response: string;
  sources: string[];
  timestamp: string;
}

export interface ChatResponse {
  conversation_id: string;
  message: ChatMessage;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  title: string | null;
  message_count: number;
  last_message: string | null;
}

export interface ConversationWithMessages {
  id: string;
  created_at: string;
  updated_at: string;
  title: string | null;
  messages: ChatMessage[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_conversations: number;
  total_messages: number;
  total_documents: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Only set JSON content type for non-FormData requests
    const defaultHeaders: Record<string, string> = {};
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies for session management
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Handle authentication errors
    if (response.status === 401) {
      // Redirect to login page or handle auth error
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error('Authentication required');
    }

    if (response.status === 403) {
      throw new Error('Access forbidden - insufficient permissions');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.makeRequest('/health');
  }

  // Chat with RAG
  async chat(question: string, conversationId?: string): Promise<ApiResponse<ChatResponse>> {
    return this.makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({
        question,
        conversation_id: conversationId,
      }),
    });
  }

  // Get conversations
  async getConversations(): Promise<ApiResponse<{ conversations: Conversation[] }>> {
    return this.makeRequest('/conversations');
  }

  // Get specific conversation
  async getConversation(id: string): Promise<ApiResponse<ConversationWithMessages>> {
    return this.makeRequest(`/conversations?id=${id}`);
  }

  // Delete conversation
  async deleteConversation(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest(`/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // Get API info
  async getApiInfo(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest('/info');
  }

  // Upload PDF (Admin only)
  async uploadPDF(file: File, sourceUrl?: string): Promise<ApiResponse<{
    document_id: string;
    filename: string;
    text_length: number;
    source_url: string;
    is_new: boolean;
    message: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (sourceUrl) {
      formData.append('source_url', sourceUrl);
    }

    return this.makeRequest('/upload/pdf', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary for multipart/form-data
      },
    });
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return this.makeRequest('/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ 
        current_password: currentPassword, 
        new_password: newPassword 
      }),
    });
  }

  async getAuthStatus(): Promise<ApiResponse<{ authenticated: boolean; user?: User }>> {
    return this.makeRequest('/auth/status');
  }

  // Admin endpoints
  async getAllUsers(): Promise<ApiResponse<{ users: User[] }>> {
    return this.makeRequest('/admin/users');
  }

  async getUser(userId: string): Promise<ApiResponse<{ user: User }>> {
    return this.makeRequest(`/admin/users/${userId}`);
  }

  async createUser(username: string, email: string, password: string, role?: 'USER' | 'ADMIN'): Promise<ApiResponse<{ user: User }>> {
    return this.makeRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    });
  }

  async promoteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest(`/admin/users/${userId}/promote`, {
      method: 'POST',
    });
  }

  async demoteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest(`/admin/users/${userId}/demote`, {
      method: 'POST',
    });
  }

  async activateUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest(`/admin/users/${userId}/activate`, {
      method: 'POST',
    });
  }

  async deactivateUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest(`/admin/users/${userId}/deactivate`, {
      method: 'POST',
    });
  }

  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    return this.makeRequest('/admin/stats');
  }
}

export const apiClient = new ApiClient();