
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
import { Users, FileText, MessageSquare, Database, LogOut, User, Settings, BarChart } from "lucide-react";
import { apiClient, AdminStats, DatabaseHealthStatus, PDFStatistics } from "@/services/apiClient";
import UserManagement from "@/components/UserManagement";
import RagStatistics from "@/components/RagStatistics";
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
  const [dbHealth, setDbHealth] = useState<DatabaseHealthStatus | null>(null);
  const [pdfStats, setPdfStats] = useState<PDFStatistics | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingPdfStats, setLoadingPdfStats] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load admin stats on component mount
  useEffect(() => {
    console.log('Admin component mounted, user:', user);
    console.log('User role:', user?.role);
    loadAdminStats();
    loadDatabaseHealth();
    loadPdfStatistics();
  }, [user]);

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

  const loadDatabaseHealth = async () => {
    try {
      const response = await apiClient.getDatabaseHealth();
      if (response.success && response.data) {
        setDbHealth(response.data);
      }
    } catch (error) {
      console.error('Error loading database health:', error);
      toast.error('Error al cargar estado de base de datos');
    } finally {
      setLoadingHealth(false);
    }
  };

  const loadPdfStatistics = async () => {
    try {
      const response = await apiClient.getPDFStatistics();
      if (response.success && response.data) {
        setPdfStats(response.data.pdf_statistics);
      }
    } catch (error) {
      console.error('Error loading PDF statistics:', error);
      toast.error('Error al cargar estadísticas de documentos');
    } finally {
      setLoadingPdfStats(false);
    }
  };

  const handleFileProcessed = (pdfData: PDFData) => {
    setPdfs((prev) => [...prev, pdfData]);
    // Reload stats after uploading a document
    loadAdminStats();
    loadPdfStatistics(); // Reload PDF stats as well
  };

  const getHealthStatusDisplay = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return { text: 'Saludable', color: 'text-green-600' };
      case 'warning':
        return { text: 'Advertencia', color: 'text-yellow-600' };
      case 'error':
        return { text: 'Error', color: 'text-red-600' };
      default:
        return { text: 'Desconocido', color: 'text-gray-600' };
    }
  };

  const getHealthIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
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
      <header className="bg-primary border-b py-4 px-6">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/Logo_Universidad_de_los_Andes.png" 
              alt="Universidad de los Andes" 
              className="h-8 w-auto mr-1"
            />
            <h1 className="text-2xl font-bold text-primary-foreground">
              <span className="text-white">ChatAdmisión</span> Admin
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleGoToHome} className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary">
              Volver al Inicio
            </Button>
            <Button onClick={handleGoToChat} className="bg-primary-foreground text-primary hover:bg-white hover:text-primary">
              Ir al chat
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary">
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="rag">Sistema RAG</TabsTrigger>
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
                    {loadingStats ? '...' : stats?.users?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loadingStats ? '...' : stats?.users?.active || 0} activos
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
                    {loadingStats ? '...' : stats?.conversations?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Promedio: {loadingStats ? '...' : stats?.conversations?.average_per_user || 0} por usuario
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
                    {loadingPdfStats ? '...' : pdfStats?.total_pdfs || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loadingPdfStats ? 'Cargando...' : `${pdfStats?.recent_additions?.last_24h || 0} añadidos hoy`}
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
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {loadingHealth ? (
                      '...'
                    ) : (
                      <>
                        <span>{getHealthIcon(dbHealth?.overall_status || 'error')}</span>
                        <span className={getHealthStatusDisplay(dbHealth?.overall_status || 'error').color}>
                          {getHealthStatusDisplay(dbHealth?.overall_status || 'error').text}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loadingHealth ? 'Verificando...' : `${dbHealth?.error_count || 0} errores detectados`}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed System Health */}
            {dbHealth && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Estado Detallado del Sistema</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {getHealthIcon(dbHealth.systems.sqlite.status)}
                        Base de Datos SQLite
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-sm font-semibold ${getHealthStatusDisplay(dbHealth.systems.sqlite.status).color}`}>
                        {getHealthStatusDisplay(dbHealth.systems.sqlite.status).text}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {dbHealth.systems.sqlite.users} usuarios, {dbHealth.systems.sqlite.conversations} conversaciones
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {getHealthIcon(dbHealth.systems.vector_db.status)}
                        Base de Datos Vectorial
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-sm font-semibold ${getHealthStatusDisplay(dbHealth.systems.vector_db.status).color}`}>
                        {getHealthStatusDisplay(dbHealth.systems.vector_db.status).text}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {dbHealth.systems.vector_db.total_chunks.toLocaleString()} chunks, {dbHealth.systems.vector_db.unique_documents} documentos
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {getHealthIcon(dbHealth.systems.file_system.status)}
                        Sistema de Archivos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-sm font-semibold ${getHealthStatusDisplay(dbHealth.systems.file_system.status).color}`}>
                        {getHealthStatusDisplay(dbHealth.systems.file_system.status).text}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {dbHealth.systems.file_system.total_files} archivos ({dbHealth.systems.file_system.total_size_mb.toFixed(1)} MB)
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {getHealthIcon(dbHealth.systems.bm25_index.status)}
                        Índice BM25
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-sm font-semibold ${getHealthStatusDisplay(dbHealth.systems.bm25_index.status).color}`}>
                        {getHealthStatusDisplay(dbHealth.systems.bm25_index.status).text}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {dbHealth.systems.bm25_index.file_size_mb.toFixed(1)} MB de índice
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* PDF Statistics Details */}
            {pdfStats && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Estadísticas de Documentos</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Documentos por Origen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Extraídos (Web)</span>
                          <span className="font-semibold">{pdfStats.scraped_pdfs}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Subidos</span>
                          <span className="font-semibold">{pdfStats.uploaded_pdfs}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Estado de Procesamiento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Exitosos</span>
                          <span className="font-semibold text-green-600">{pdfStats.processing_status.success}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Fallidos</span>
                          <span className="font-semibold text-red-600">{pdfStats.processing_status.failed}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Últimas 24h</span>
                          <span className="font-semibold">{pdfStats.recent_additions.last_24h}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Última semana</span>
                          <span className="font-semibold">{pdfStats.recent_additions.last_week}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
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
          
          <TabsContent value="rag" className="space-y-6">
            <RagStatistics />
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
