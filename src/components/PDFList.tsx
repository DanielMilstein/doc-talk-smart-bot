
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PDFData } from "./PDFUploader";
import { Separator } from "@/components/ui/separator";

interface PDFListProps {
  pdfs: PDFData[];
  onDeletePDF: (id: string) => void;
  activePDF: string | null;
  setActivePDF: (id: string) => void;
}

const PDFList: React.FC<PDFListProps> = ({
  pdfs,
  onDeletePDF,
  activePDF,
  setActivePDF,
}) => {
  if (pdfs.length === 0) {
    return (
      <Card className="flex-grow">
        <CardHeader>
          <CardTitle className="text-lg font-medium">My Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p>No PDFs uploaded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-grow">
      <CardHeader>
        <CardTitle className="text-lg font-medium">My Documents</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {pdfs.map((pdf) => (
            <li key={pdf.id} className="py-3 px-6">
              <div 
                className={`flex items-center justify-between cursor-pointer ${
                  activePDF === pdf.id ? "bg-muted/50 rounded-md -mx-1 px-1" : ""
                }`}
                onClick={() => setActivePDF(pdf.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
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
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate max-w-[180px]">{pdf.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span>{pdf.pages} pages</span>
                      <span className="mx-1.5">•</span>
                      <span>{pdf.size}</span>
                      <span className="mx-1.5">•</span>
                      <span>
                        {new Date(pdf.dateAdded).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePDF(pdf.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PDFList;
