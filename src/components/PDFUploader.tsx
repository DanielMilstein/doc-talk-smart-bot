import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { InfoIcon, Upload, CheckCircle, Shield } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useAuth } from "@/contexts/AuthContext";

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
  const [isUploading, setIsUploading] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const { user } = useAuth();

  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin';

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Solo se permiten archivos PDF");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Archivo excede el tamaño máximo de 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const response = await apiClient.uploadPDF(file, sourceUrl || undefined);
      
      if (response.success && response.data) {
        const { document_id, filename, text_length, is_new, message } = response.data;
        
        // Create PDFData object for local state
        const pdfData: PDFData = {
          id: document_id,
          name: filename,
          content: `Document uploaded with ${text_length} characters extracted`,
          pages: 1, // Backend doesn't return page count
          size: formatBytes(file.size),
          dateAdded: new Date(),
        };

        if (is_new) {
          toast.success(`"${filename}" subido con éxito`);
        } else {
          toast.info(`"${filename}" ya existe en el sistema`);
        }

        onFileProcessed(pdfData);
        setSourceUrl(""); // Clear source URL after successful upload
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Error al subir el PDF");
    } finally {
      setIsUploading(false);
    }
  }, [onFileProcessed, sourceUrl]);

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

  const isDisabled = isProcessing || isUploading || !isAdmin;

  // If user is not admin, show restricted access message
  if (!isAdmin) {
    return (
      <div className="w-full h-full flex flex-col space-y-4">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Acceso restringido:</strong> Solo los administradores pueden subir documentos PDF. 
            Contacta a un administrador para agregar nuevos documentos al sistema.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Subida de Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta funcionalidad está restringida a usuarios administradores para mantener 
              la calidad y seguridad del sistema RAG.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Subida de documentos habilitada:</strong> Como administrador, puedes subir archivos PDF que se procesarán 
          automáticamente con el sistema RAG. Los documentos se almacenarán en el servidor y estarán 
          disponibles para consultas inmediatamente.
        </AlertDescription>
      </Alert>
      
      <Card className="flex-grow">
        <CardHeader>
          <CardTitle>Subir Documento PDF</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Source URL input */}
            <div className="space-y-2">
              <Label htmlFor="source-url">URL de origen (opcional)</Label>
              <Input
                id="source-url"
                type="url"
                placeholder="https://example.com/document.pdf"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                disabled={isDisabled}
              />
              <p className="text-xs text-muted-foreground">
                Si el documento proviene de una URL específica, agrégala aquí para mejor trazabilidad
              </p>
            </div>

            {/* Upload area */}
            <div
              className={`border-2 border-dashed rounded-lg h-64 flex flex-col items-center justify-center p-6 transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50"
              } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Subiendo y procesando PDF...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground mb-2">
                    Arrastra y suelta tu archivo PDF aquí
                  </p>
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    o
                  </p>
                  <label htmlFor="pdf-upload">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      disabled={isDisabled}
                    >
                      Selecciona PDF
                      <input
                        id="pdf-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileInputChange}
                        disabled={isDisabled}
                      />
                    </Button>
                  </label>
                </>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground text-center space-y-1">
              <p>Tamaño máximo: 10MB</p>
              <p>Solo archivos PDF con texto extraíble</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Después de subir:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• El texto será extraído automáticamente</li>
              <li>• El documento se agregará al sistema RAG</li>
              <li>• Estará disponible para consultas inmediatamente</li>
              <li>• Las respuestas incluirán referencias al documento</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFUploader;