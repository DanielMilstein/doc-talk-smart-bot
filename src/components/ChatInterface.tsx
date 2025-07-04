
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage, { Message, MessageRole } from "./ChatMessage";
import { PDFData } from "./PDFUploader";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { askQuestion, checkBackendHealth, getConversationWithMessages } from "@/services/PDFService";
import { ConversationWithMessages } from "@/services/apiClient";

interface ChatInterfaceProps {
  pdfs: PDFData[];
  onStartNewChat: () => void;
  loadConversationId?: string;
  onConversationCreated?: (conversationId: string) => void;
  onMessageSent?: () => void; // Callback when a message is sent
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  pdfs, 
  onStartNewChat, 
  loadConversationId,
  onConversationCreated,
  onMessageSent 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [backendHealthy, setBackendHealthy] = useState<boolean>(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load conversation when loadConversationId changes
  useEffect(() => {
    if (loadConversationId) {
      loadConversation(loadConversationId);
    } else {
      // New chat - reset everything
      setMessages([]);
      setConversationId(undefined);
      initializeNewChat();
    }
  }, [loadConversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check backend health
  useEffect(() => {
    checkBackendHealth().then(setBackendHealthy);
  }, []);

  const initializeNewChat = async () => {
    const isHealthy = await checkBackendHealth();
    setBackendHealthy(isHealthy);
    
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: isHealthy 
        ? "¡Hola! Estoy conectado al sistema RAG y listo para responder preguntas sobre documentos de admisión. ¿En qué puedo ayudarte?"
        : "Hola! Actualmente estoy en modo offline. El sistema RAG no está disponible, pero puedo intentar ayudarte con información general.",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const loadConversation = async (conversationIdToLoad: string) => {
    setIsLoadingConversation(true);
    try {
      const conversation = await getConversationWithMessages(conversationIdToLoad);
      if (conversation) {
        setConversationId(conversation.id);
        
        // Convert backend messages to frontend Message format
        const convertedMessages: Message[] = [];
        
        // Add welcome message first
        const isHealthy = await checkBackendHealth();
        setBackendHealthy(isHealthy);
        
        const welcomeMessage: Message = {
          id: "welcome",
          role: "assistant" as MessageRole,
          content: isHealthy
            ? "¡Hola! Estoy conectado al sistema RAG y listo para responder preguntas sobre documentos de admisión. ¿En qué puedo ayudarte?"
            : "Hola! Actualmente estoy en modo offline. El sistema RAG no está disponible, pero puedo intentar ayudarte con información general.",
          timestamp: new Date(),
        };
        convertedMessages.push(welcomeMessage);
        
        // Add conversation messages
        conversation.messages.forEach(msg => {
          // Add user message
          convertedMessages.push({
            id: `${msg.id}-question`,
            role: "user" as MessageRole,
            content: msg.question,
            timestamp: new Date(msg.timestamp),
          });
          // Add assistant response
          convertedMessages.push({
            id: msg.id,
            role: "assistant" as MessageRole,
            content: msg.response,
            timestamp: new Date(msg.timestamp),
            sources: msg.sources,
          });
        });
        
        setMessages(convertedMessages);
      } else {
        toast.error('Conversación no encontrada');
        onStartNewChat();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Error al cargar conversación');
      onStartNewChat();
    } finally {
      setIsLoadingConversation(false);
    }
  };

  // Reset conversation when starting new chat
  const handleStartNewChat = () => {
    setConversationId(undefined);
    onStartNewChat();
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    const question = input;
    setInput("");
    setIsProcessing(true);
    
    try {
      if (backendHealthy) {
        // Use real RAG backend
        const response = await askQuestion(question, conversationId);
        
        // Set conversation ID if this is a new conversation
        if (!conversationId) {
          setConversationId(response.conversation_id);
          // Notify parent component about new conversation
          if (onConversationCreated) {
            onConversationCreated(response.conversation_id);
          }
        }
        
        const assistantMessage: Message = {
          id: response.message.id,
          role: "assistant",
          content: response.message.response,
          timestamp: new Date(response.message.timestamp),
          sources: response.message.sources,
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Notify parent that a message was sent
        if (onMessageSent) {
          onMessageSent();
        }
      } else {
        // Fallback to mock responses when backend is unavailable
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Lo siento, el sistema RAG no está disponible en este momento. Por favor, inténtalo más tarde o contacta al administrador.",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error generando respuesta:", error);
      toast.error("Error al generar respuesta");
      
      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Lo siento, ocurrió un error al procesar tu pregunta. Por favor, inténtalo de nuevo.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  

  return (
    <Card className="flex-grow flex flex-col h-full">
      <CardHeader className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Asistente Virtual RAG
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({backendHealthy ? 'Conectado' : 'Offline'})
            </span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleStartNewChat}>
            Nuevo Chat
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto p-6">
        {isLoadingConversation ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando conversación...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isProcessing && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 bg-muted-foreground/70 animate-bounce-subtle rounded-full"></span>
                <span className="h-2 w-2 bg-muted-foreground/70 animate-bounce-subtle rounded-full [animation-delay:150ms]"></span>
                <span className="h-2 w-2 bg-muted-foreground/70 animate-bounce-subtle rounded-full [animation-delay:300ms]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={backendHealthy ? "Pregunta sobre documentos de admisión..." : "Sistema offline - funcionalidad limitada"}
            disabled={isProcessing}
            className="flex-grow"
          />
          <Button type="submit" disabled={isProcessing || !input.trim()}>
            Enviar
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
