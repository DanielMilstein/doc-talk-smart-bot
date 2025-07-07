
import * as pdfjsLib from 'pdfjs-dist';
import { apiClient, ChatMessage, Conversation, ConversationWithMessages, ChatResponse } from './apiClient';

// This would normally be set up properly in a real app
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: { str: string }) => item.str).join(' ');
      fullText += textItems + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// RAG implementation using the backend API
export async function askQuestion(question: string, conversationId?: string): Promise<ChatResponse> {
  try {
    const response = await apiClient.chat(question, conversationId);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get response from backend');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error asking question:', error);
    throw new Error('Failed to get response from RAG system');
  }
}

// Health check for backend connectivity
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await apiClient.healthCheck();
    return response.success;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

// Get all conversations
export async function getAllConversations(): Promise<Conversation[]> {
  try {
    const response = await apiClient.getConversations();
    return response.success && response.data ? response.data.conversations : [];
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

// Get specific conversation with messages
export async function getConversationWithMessages(conversationId: string): Promise<ConversationWithMessages | null> {
  try {
    const response = await apiClient.getConversation(conversationId);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
}

// Delete conversation
export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    const response = await apiClient.deleteConversation(conversationId);
    return response.success;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
}

// Generate conversation title from first message
export function generateConversationTitle(firstMessage: string): string {
  // Take first 50 characters and add ellipsis if needed
  const maxLength = 50;
  const title = firstMessage.trim();
  return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
}
