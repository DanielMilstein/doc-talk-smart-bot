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
  enhancedInfo?: EnhancedInfo;
}

export interface ConfidenceInfo {
  level: 'high' | 'medium' | 'low' | 'very_low';
  score: number;
  explanation: string;
  recommendations: string[];
}

export interface ConversationContext {
  total_turns: number;
  has_summary: boolean;
  recent_turns: number;
  last_updated: string;
}

export interface EnhancedInfo {
  query_type: string;
  complexity_score: number;
  processing_time: number;
  context_summary: {
    total_docs: number;
    total_chars: number;
    sources: string[];
  };
  confidence?: ConfidenceInfo;
  recommendations: string[];
  is_follow_up: boolean;
  conversation_context: ConversationContext;
}

export interface ChatResponse {
  conversation_id: string;
  message: ChatMessage;
  enhanced_info?: EnhancedInfo;
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
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    admins: number;
    regular_users: number;
    inactive: number;
    recent_registrations: number;
  };
  conversations: {
    total: number;
    recent: number;
    average_per_user: number;
  };
  system: {
    current_admin: string;
    timestamp: string;
  };
}

export interface DatabaseHealthStatus {
  overall_status: 'healthy' | 'warning' | 'error';
  error_count: number;
  summary: {
    sqlite_healthy: boolean;
    vector_db_healthy: boolean;
    file_system_healthy: boolean;
    bm25_healthy: boolean;
  };
  systems: {
    sqlite: {
      status: 'healthy' | 'warning' | 'error';
      connection: string;
      users: number;
      conversations: number;
      messages: number;
      tables: string[];
      admins: number;
    };
    vector_db: {
      status: 'healthy' | 'warning' | 'error';
      database_path: string;
      embedding_model: string;
      total_chunks: number;
      unique_documents: number;
      pdf_documents: number;
      uploaded_documents: number;
    };
    file_system: {
      status: 'healthy' | 'warning' | 'error';
      data_directory: string;
      total_files: number;
      markdown_files: number;
      total_size_mb: number;
      url_index_exists: boolean;
    };
    bm25_index: {
      status: 'healthy' | 'warning' | 'error';
      index_path: string;
      index_file_exists: boolean;
      file_size_mb: number;
    };
  };
}

export interface PDFStatistics {
  total_pdfs: number;
  scraped_pdfs: number;
  uploaded_pdfs: number;
  processing_status: {
    success: number;
    failed: number;
  };
  recent_additions: {
    last_24h: number;
    last_week: number;
  };
  pdf_sources: Array<{
    document_hash: string;
    original_source: string;
    type: 'scraped' | 'uploaded';
  }>;
}

export interface RagStats {
  total_queries: number;
  avg_processing_time: number;
  confidence_distribution: {
    high: number;
    medium: number;
    low: number;
    very_low: number;
  };
  query_type_distribution?: {
    [key: string]: number;
  };
  hybrid_search?: {
    bm25_documents: number;
    config: {
      fusion_method: string;
      keyword_weight: number;
      parallel_search: boolean;
      rrf_k: number;
      semantic_weight: number;
    };
    query_type_weights: {
      [key: string]: {
        keyword: number;
        semantic: number;
      };
    };
  };
}

export interface MemoryStats {
  cache_size: number;
  active_conversations: number;
  total_memories: number;
  average_conversation_length: number;
  follow_up_rate: number;
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

  async createUser(username: string, email: string, password: string, role?: 'user' | 'admin'): Promise<ApiResponse<{ user: User }>> {
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
    const response = await this.makeRequest<{ stats: AdminStats }>('/admin/stats');
    // Extract the stats from the nested response structure
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.stats
      };
    }
    return {
      ...response,
      data: undefined
    };
  }

  // RAG Statistics endpoints
  async getRagStats(): Promise<ApiResponse<{ rag_statistics: RagStats; description: string }>> {
    return this.makeRequest('/rag/stats');
  }

  async resetRagStats(): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest('/rag/reset-stats', {
      method: 'POST',
    });
  }

  // Conversation Memory endpoints
  async getConversationMemory(conversationId: string): Promise<ApiResponse<{
    conversation_id: string;
    has_memory: boolean;
    memory_turns: number;
    summary?: string;
    recent_context?: Array<{ question: string; answer: string; timestamp: string }>;
  }>> {
    return this.makeRequest(`/conversations/${conversationId}/memory`);
  }

  async clearConversationMemory(conversationId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest(`/conversations/${conversationId}/memory`, {
      method: 'DELETE',
    });
  }

  async getMemoryStats(): Promise<ApiResponse<{ memory_statistics: MemoryStats }>> {
    return this.makeRequest('/memory/stats');
  }

  // Database Health endpoints
  async getDatabaseHealth(): Promise<ApiResponse<DatabaseHealthStatus>> {
    return this.makeRequest('/database/health');
  }

  async getPDFStatistics(): Promise<ApiResponse<{ pdf_statistics: PDFStatistics; summary: PDFStatistics }>> {
    return this.makeRequest('/database/pdf-count');
  }

  // General health endpoint
  async getSystemHealth(): Promise<ApiResponse<{ service: string; status: string; version: string }>> {
    return this.makeRequest('/health');
  }
}

export const apiClient = new ApiClient();