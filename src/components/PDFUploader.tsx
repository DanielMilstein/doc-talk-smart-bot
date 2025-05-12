
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface PDFUploaderProps {
  onFileProcessed: (pdfData: PDFData) => void;
  isProcessing: boolean;
}

export interface PDFData {
  id: string;
  name: string;
  content: string;
  pages: number;
  size: string;
  dateAdded: Date;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileProcessed, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are supported");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    try {
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // We'll use the pdfjsLib in a separate service, for now we'll just simulate
      // Extract text using a simple method for this demo
      const textContent = "Extracted text would be here in production";
      
      // Generate a unique ID for the PDF
      const pdfData: PDFData = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        content: textContent,
        pages: Math.floor(Math.random() * 10) + 1, // Simulating page count for now
        size: formatBytes(file.size),
        dateAdded: new Date(),
      };

      toast.success(`"${file.name}" uploaded successfully`);
      onFileProcessed(pdfData);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF file");
    }
  }, [onFileProcessed]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <Card className="flex-grow">
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg h-64 flex flex-col items-center justify-center p-6 transition-colors ${
              isDragging ? "pdf-drop-active" : "hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg
              className="w-12 h-12 text-muted-foreground mb-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
            <p className="text-center text-muted-foreground mb-2">
              Drag and drop your PDF here
            </p>
            <p className="text-center text-sm text-muted-foreground mb-4">
              or
            </p>
            <label htmlFor="pdf-upload">
              <Button
                variant="outline"
                className="cursor-pointer"
                disabled={isProcessing}
              >
                Select PDF
                <input
                  id="pdf-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                  disabled={isProcessing}
                />
              </Button>
            </label>
          </div>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>Maximum file size: 10MB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFUploader;
