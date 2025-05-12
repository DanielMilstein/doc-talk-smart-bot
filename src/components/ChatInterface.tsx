
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ChatMessage, { Message, MessageRole } from "./ChatMessage";
import { PDFData } from "./PDFUploader";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ChatInterfaceProps {
  activePDF: PDFData | null;
  onStartNewChat: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ activePDF, onStartNewChat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Add intro message when active PDF changes
  useEffect(() => {
    if (activePDF) {
      const introMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I'm ready to answer questions about "${activePDF.name}". What would you like to know?`,
        timestamp: new Date(),
      };
      setMessages([introMessage]);
    } else {
      setMessages([]);
    }
  }, [activePDF]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !activePDF) return;
    
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
      
      // In a real implementation, we would:
      // 1. Process the PDF content using PDF.js
      // 2. Create embeddings from the PDF content
      // 3. Search for relevant content based on the user's question
      // 4. Generate a response using an AI model
      
      const aiResponse = generateMockResponse(input, activePDF.name);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("Failed to generate a response");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const generateMockResponse = (question: string, pdfName: string): string => {
    // Simple mock responses based on question keywords
    const responses = [
      `Based on the content of "${pdfName}", I found that the main points related to your question are about improving efficiency through process optimization and resource allocation.`,
      `The document "${pdfName}" mentions that this topic was researched extensively in 2023, with findings suggesting a correlation between the factors you're asking about.`,
      `According to "${pdfName}", the answer to your question involves multiple factors including market trends, regulatory requirements, and operational constraints.`,
      `I couldn't find specific information about this in "${pdfName}". Would you like to ask something else about the document?`,
      `The data in "${pdfName}" shows that approximately 75% of cases exhibit the pattern you're asking about, with variations depending on contextual factors.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  if (!activePDF) {
    return (
      <Card className="flex-grow flex flex-col h-full">
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <svg
            className="w-16 h-16 text-muted-foreground mb-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <h3 className="text-lg font-medium mb-2">No PDF Selected</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Upload a PDF document or select one from your list to start chatting with the AI about its contents.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-grow flex flex-col h-full">
      <CardHeader className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{activePDF.name}</CardTitle>
          <Button variant="outline" size="sm" onClick={onStartNewChat}>
            New Chat
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
            placeholder="Ask a question about this document..."
            disabled={isProcessing}
            className="flex-grow"
          />
          <Button type="submit" disabled={isProcessing || !input.trim()}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
