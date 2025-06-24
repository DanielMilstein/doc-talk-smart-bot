
import * as pdfjsLib from 'pdfjs-dist';
import { apiClient, ChatMessage } from './apiClient';

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
export async function askQuestion(question: string, conversationId?: string): Promise<ChatMessage> {
  try {
    const response = await apiClient.chat(question, conversationId);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get response from backend');
    }
    
    return response.data.message;
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

// Get conversation history
export async function getConversationHistory(conversationId?: string) {
  try {
    if (conversationId) {
      const response = await apiClient.getConversation(conversationId);
      return response.success ? response.data : null;
    } else {
      const response = await apiClient.getConversations();
      return response.success ? response.data : [];
    }
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return conversationId ? null : [];
  }
}
