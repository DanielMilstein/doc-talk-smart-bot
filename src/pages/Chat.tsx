
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage, { Message, MessageRole } from "@/components/ChatMessage";
import { PDFData } from "@/components/PDFUploader";
import { toast } from "sonner";

const Chat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePDF, setActivePDF] = useState<PDFData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Get the PDF from location state when navigating from the home page
  useEffect(() => {
    if (location.state?.pdf) {
      setActivePDF(location.state.pdf);
      
      // Add intro message when PDF is set
      const introMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I'm ready to answer questions about "${location.state.pdf.name}". What would you like to know?`,
        timestamp: new Date(),
      };
      setMessages([introMessage]);
    } else {
      // If no PDF is provided, redirect back to home
      toast.error("No PDF selected. Please select a PDF first.");
      navigate("/");
    }
  }, [location.state, navigate]);

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

  const handleBackToList = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="bg-background border-b py-4 px-6">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            PDF <span className="text-primary">ChatRAG</span>
          </h1>
          <Button variant="outline" onClick={handleBackToList}>
            Back to Documents
          </Button>
        </div>
      </header>
      
      <main className="container flex-grow py-6">
        <Card className="flex-grow flex flex-col h-[calc(100vh-12rem)]">
          <CardHeader className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">
                {activePDF ? activePDF.name : "Chat"}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setMessages([])}>
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
      </main>
      
      <footer className="bg-background border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <div className="container">
          PDF ChatRAG - Ask questions about your PDF documents
        </div>
      </footer>
    </div>
  );
};

export default Chat;
