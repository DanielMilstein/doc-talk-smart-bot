
import React, { useState } from "react";
import { PDFData } from "@/components/PDFUploader";
import PDFUploader from "@/components/PDFUploader";
import PDFList from "@/components/PDFList";
import ChatInterface from "@/components/ChatInterface";
import { toast } from "sonner";

const Index: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDFData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileProcessed = (pdfData: PDFData) => {
    setIsProcessing(true);
    
    // Simulate PDF processing time
    setTimeout(() => {
      setPdfs((prev) => [...prev, pdfData]);
      setIsProcessing(false);
      toast.success("PDF successfully processed");
    }, 1000);
  };

  const handleDeletePDF = (id: string) => {
    setPdfs((prev) => prev.filter((pdf) => pdf.id !== id));
    toast.success("Document removed");
  };

  const handleStartNewChat = () => {
    // Reset chat to initial state
    toast.success("Started a new chat");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="bg-background border-b py-4 px-6">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            PDF <span className="text-primary">ChatRAG</span>
          </h1>
        </div>
      </header>
      
      <main className="container flex-grow py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: PDF upload and management */}
          <div className="space-y-6">
            <PDFUploader 
              onFileProcessed={handleFileProcessed} 
              isProcessing={isProcessing}
            />
            
            <PDFList 
              pdfs={pdfs}
              onDeletePDF={handleDeletePDF}
            />
          </div>
          
          {/* Right column: Chat interface */}
          <div className="h-[calc(100vh-12rem)]">
            <ChatInterface 
              pdfs={pdfs}
              onStartNewChat={handleStartNewChat}
            />
          </div>
        </div>
      </main>
      
      <footer className="bg-background border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <div className="container">
          PDF ChatRAG - Ask questions about your PDF documents
        </div>
      </footer>
    </div>
  );
};

export default Index;
