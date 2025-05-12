import React, { useState } from "react";
import { PDFData } from "@/components/PDFUploader";
import PDFUploader from "@/components/PDFUploader";
import PDFList from "@/components/PDFList";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDFData[]>([]);
  const [activePDFId, setActivePDFId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileProcessed = (pdfData: PDFData) => {
    setIsProcessing(true);
    
    // Simulate PDF processing time
    setTimeout(() => {
      setPdfs((prev) => [...prev, pdfData]);
      setActivePDFId(pdfData.id);
      setIsProcessing(false);
    }, 1000);
  };

  const handleDeletePDF = (id: string) => {
    setPdfs((prev) => prev.filter((pdf) => pdf.id !== id));
    if (activePDFId === id) {
      setActivePDFId(null);
    }
    toast.success("Document removed");
  };

  const handleStartNewChat = () => {
    // In a real app, this would clear the chat history but keep the same PDF
    toast.info("Started a new chat session");
  };

  const activePDF = pdfs.find((pdf) => pdf.id === activePDFId) || null;

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="bg-background border-b py-4 px-6">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            PDF <span className="text-primary">ChatRAG</span>
          </h1>
        </div>
      </header>
      
      <main className="container flex-grow py-6 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <PDFUploader 
            onFileProcessed={handleFileProcessed} 
            isProcessing={isProcessing}
          />
          <PDFList 
            pdfs={pdfs}
            onDeletePDF={handleDeletePDF}
            activePDF={activePDFId}
            setActivePDF={setActivePDFId}
          />
        </div>
        
        <div className="w-full md:w-2/3 flex flex-col">
          <ChatInterface 
            activePDF={activePDF}
            onStartNewChat={handleStartNewChat}
          />
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
