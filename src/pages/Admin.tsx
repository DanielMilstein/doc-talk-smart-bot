
import React, { useState } from "react";
import { PDFData } from "@/components/PDFUploader";
import PDFUploader from "@/components/PDFUploader";
import PDFList from "@/components/PDFList";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Admin: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDFData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

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

  const handleGoToChat = () => {
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="bg-background border-b py-4 px-6">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            PDF <span className="text-primary">ChatRAG</span> Admin
          </h1>
          <Button onClick={handleGoToChat}>Go to Chat</Button>
        </div>
      </header>
      
      <main className="container flex-grow py-6">
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
      </main>
      
      <footer className="bg-background border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <div className="container">
          PDF ChatRAG Admin - Upload and manage documents
        </div>
      </footer>
    </div>
  );
};

export default Admin;
