
import React, { useState, useEffect } from "react";
import { PDFData } from "@/components/PDFUploader";
import PDFUploader from "@/components/PDFUploader";
import PDFList from "@/components/PDFList";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, MessageSquare, Database, LogOut, User, Settings } from "lucide-react";
import { apiClient, AdminStats } from "@/services/apiClient";
import UserManagement from "@/components/UserManagement";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Admin: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDFData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load admin stats on component mount
  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const response = await apiClient.getAdminStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleFileProcessed = (pdfData: PDFData) => {
    setPdfs((prev) => [...prev, pdfData]);
    // Reload stats after uploading a document
    loadAdminStats();
  };

  const handleDeletePDF = (id: string) => {
    setPdfs((prev) => prev.filter((pdf) => pdf.id !== id));
    toast.success("Documento eliminado con éxito");
  };

  const handleGoToChat = () => {
    navigate("/chat");
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="bg-background border-b py-4 px-6">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-primary">ChatAdmisión</span> Admin
          </h1>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleGoToHome}>
              Volver al Inicio
            </Button>
            <Button onClick={handleGoToChat}>
              Ir al chat
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user?.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={goToProfile}>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={goToProfile}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="container flex-grow py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Usuarios
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingStats ? '...' : stats?.total_users || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loadingStats ? '...' : stats?.active_users || 0} activos
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conversaciones
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingStats ? '...' : stats?.total_conversations || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loadingStats ? '...' : stats?.total_messages || 0} mensajes
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Documentos
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingStats ? '...' : stats?.total_documents || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDFs cargados
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Base de Datos
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Activa
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sistema operativo
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-6">
            <PDFUploader 
              onFileProcessed={handleFileProcessed} 
              isProcessing={isProcessing}
            />
            
            <PDFList 
              pdfs={pdfs}
              onDeletePDF={handleDeletePDF}
            />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-background border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <div className="container">
          Panel de administración - {user?.username}
        </div>
      </footer>
    </div>
  );
};

export default Admin;
