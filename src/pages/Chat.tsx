
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { PDFData } from "@/components/PDFUploader";

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState<PDFData[]>([]);

  // In a real application, you would fetch the PDFs from your storage/database here
  // For now, we'll just use a mock example
  useEffect(() => {
    // Mock fetching PDFs from storage that would be uploaded by admins
    const mockPdfs: PDFData[] = [
      {
        id: "pdf1",
        name: "Sample Document 1",
        content: "Sample content for document 1",
        pages: 10,
        size: "1.2 MB",
        dateAdded: new Date()
      },
      {
        id: "pdf2",
        name: "Sample Document 2",
        content: "Sample content for document 2",
        pages: 5,
        size: "0.8 MB",
        dateAdded: new Date()
      }
    ];
    
    setPdfs(mockPdfs);
  }, []);

  const handleStartNewChat = () => {
    // Logic to start a new chat
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="bg-background border-b py-4 px-6">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-primary">ChatAdmisión</span>
          </h1>
          <Button variant="outline" onClick={handleGoToHome}>
            Volver al Inicio
          </Button>
        </div>
      </header>
      
      <main className="container flex-grow py-6">
        <div className="h-[calc(100vh-12rem)]">
          <ChatInterface pdfs={pdfs} onStartNewChat={handleStartNewChat} />
        </div>
      </main>
      
      <footer className="bg-background border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <div className="container">
          ChatAdmisión - Asistente Virtual
        </div>
      </footer>
    </div>
  );
};

export default Chat;
