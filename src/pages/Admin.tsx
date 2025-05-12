
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
      toast.success("PDF procesado con éxito");
    }, 1000);
  };

  const handleDeletePDF = (id: string) => {
    setPdfs((prev) => prev.filter((pdf) => pdf.id !== id));
    toast.success("Documento eliminado con éxito");
  };

  const handleGoToChat = () => {
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="bg-background border-b py-4 px-6">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-primary">ChatAdmisión</span> Admin
          </h1>
          <Button onClick={handleGoToChat}>Ir al chat</Button>
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
          Panel de administración
        </div>
      </footer>
    </div>
  );
};

export default Admin;
