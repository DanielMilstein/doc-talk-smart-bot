
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage, { Message, MessageRole } from "./ChatMessage";
import { PDFData } from "./PDFUploader";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ChatInterfaceProps {
  pdfs: PDFData[];
  onStartNewChat: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ pdfs, onStartNewChat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Add intro message when component mounts
  useEffect(() => {
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: pdfs.length > 0 
        ? `Estoy listo para contestar preguntas, tienes ${pdfs.length} documento${pdfs.length !== 1 ? 's' : ''} subidos.`
        : "Estoy listo para chatear! Sube algunos documentos para que pueda responder preguntas sobre ellos.",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Update welcome message when PDFs change
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "assistant") {
      const updatedWelcomeMessage: Message = {
        ...messages[0],
        content: pdfs.length > 0 
          ? `Estoy listo para contestar preguntas, tienes ${pdfs.length} documentos ${pdfs.length !== 1 ? 's' : ''} subidos.`
          : "Estoy listo para chatear! Sube algunos documentos para que pueda responder preguntas sobre ellos.",
      };
      setMessages([updatedWelcomeMessage]);
    }
  }, [pdfs]);

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
    setInput("");
    setIsProcessing(true);
    
    try {
      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      let aiResponse: string;
      
      if (pdfs.length > 0) {
        // In a real implementation, we would:
        // 1. Process the content of all PDFs
        // 2. Create embeddings from the PDF content
        // 3. Search for relevant content based on the user's question across all PDFs
        // 4. Generate a response using an AI model
        aiResponse = generateResponseFromPDFs(input, pdfs);
      } else {
        // General chat without PDF context
        aiResponse = generateGeneralResponse(input);
      }
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generando respuesta:", error);
      toast.error("Falla al generar respuesta");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const generateResponseFromPDFs = (question: string, pdfs: PDFData[]): string => {
    // Simple mock responses based on question keywords when PDFs are available
    const pdfNames = pdfs.map(pdf => `"${pdf.name}"`).join(", ");
    

    const responses = [
      `Basado en el contenido de tus documentos (${pdfNames}), encontré que los puntos principales relacionados con tu pregunta son sobre mejorar la eficiencia a través de la optimización de procesos y la asignación de recursos.`,
      `Tus documentos mencionan que este tema fue investigado extensamente en 2023, con hallazgos que sugieren una correlación entre los factores que preguntas.`,
      `Según los documentos subidos, la respuesta a tu pregunta involucra múltiples factores incluyendo tendencias de mercado, requisitos regulatorios y restricciones operativas.`,
      `Busqué en todos tus documentos y encontré que aproximadamente el 75% de los casos exhiben el patrón que preguntas, con variaciones dependiendo de factores contextuales.`,
      `Los documentos muestran diferentes perspectivas sobre este tema. Algunos enfatizan la importancia de la innovación, mientras que otros se centran más en la gestión de riesgos y el cumplimiento.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const generateGeneralResponse = (question: string): string => {
    // Simple mock responses for general chat without PDFs

    const responses = [
      "Puedo proporcionarte información general sobre este tema, pero si subes documentos relevantes, podré darte respuestas más específicas.",
      "¡Esa es una pregunta interesante! En general, los expertos sugieren abordar esto desde múltiples ángulos. Sube documentos específicos para obtener información más personalizada.",
      "Según el conocimiento general, hay varias perspectivas sobre este asunto. Para obtener información más precisa, considera subir PDFs relevantes.",
      "Puedo hablar sobre este tema en términos generales. Para obtener información de documentos específicos, intenta subir algunos PDFs relacionados con tu pregunta.",
      "Si bien puedo discutir esto en términos generales, mi especialidad es analizar el contenido de documentos. ¡Sube algunos PDFs para ver cómo puedo extraer información específica para ti!"
    ]
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <Card className="flex-grow flex flex-col h-full">
      <CardHeader className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Asistente Virtual
            {pdfs.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({pdfs.length} document{pdfs.length !== 1 ? 's' : ''})
              </span>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onStartNewChat}>
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
            placeholder={pdfs.length > 0 ? "Preguntame sobre tus documentos" : "Preguntame cualquier cosa..."}
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
