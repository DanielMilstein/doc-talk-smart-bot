
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage, { Message, MessageRole } from "./ChatMessage";
import { PDFData } from "./PDFUploader";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { askQuestion, checkBackendHealth } from "@/services/PDFService";

interface ChatInterfaceProps {
  pdfs: PDFData[];
  onStartNewChat: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ pdfs, onStartNewChat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [backendHealthy, setBackendHealthy] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check backend health and add intro message when component mounts
  useEffect(() => {
    const initializeChat = async () => {
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
    
    initializeChat();
  }, []);

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
        if (!conversationId && response.id) {
          const conversationIdFromResponse = response.id.split('-')[0]; // Extract conversation ID from message ID
          setConversationId(conversationIdFromResponse);
        }
        
        const assistantMessage: Message = {
          id: response.id,
          role: "assistant",
          content: response.response,
          timestamp: new Date(response.timestamp),
          sources: response.sources,
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
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
