
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFData } from "@/components/PDFUploader";
import PDFUploader from "@/components/PDFUploader";
import PDFList from "@/components/PDFList";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index: React.FC = () => {
  const navigate = useNavigate();
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
      toast.success("PDF successfully processed");
    }, 1000);
  };

  const handleDeletePDF = (id: string) => {
    setPdfs((prev) => prev.filter((pdf) => pdf.id !== id));
    if (activePDFId === id) {
      setActivePDFId(null);
    }
    toast.success("Document removed");
  };

  const handleChatWithPDF = () => {
    const activePDF = pdfs.find((pdf) => pdf.id === activePDFId);
    if (activePDF) {
      navigate("/chat", { state: { pdf: activePDF } });
    } else {
      toast.error("Please select a PDF first");
    }
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
        <div className="space-y-6">
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
          
          {activePDFId && (
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={handleChatWithPDF}
                className="px-8"
              >
                Chat with Document
              </Button>
            </div>
          )}
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
