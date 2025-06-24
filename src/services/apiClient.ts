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
  messages: ChatMessage[];
  created_at: string;
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
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

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
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return this.makeRequest('/conversations');
  }

  // Get specific conversation
  async getConversation(id: string): Promise<ApiResponse<Conversation>> {
    return this.makeRequest(`/conversations?conversation_id=${id}`);
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

  // Upload PDF
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
}

export const apiClient = new ApiClient();