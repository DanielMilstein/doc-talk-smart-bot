
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import ChatHistory from "@/components/ChatHistory";
import { Button } from "@/components/ui/button";
import { PDFData } from "@/components/PDFUploader";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [pdfs, setPdfs] = useState<PDFData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  // In a real application, you would fetch the PDFs from your storage/database here
  // For now, we'll just use a mock example
  useEffect(() => {
    // Mock fetching PDFs from storage that would be uploaded by admins
    const mockPdfs: PDFData[] = [
      {
        id: "pdf1",
        name: "Sample Document 1",
        content: "Sample content for document 1",
        pages: 10,
        size: "1.2 MB",
        dateAdded: new Date()
      },
      {
        id: "pdf2",
        name: "Sample Document 2",
        content: "Sample content for document 2",
        pages: 5,
        size: "0.8 MB",
        dateAdded: new Date()
      }
    ];
    
    setPdfs(mockPdfs);
  }, []);

  const handleStartNewChat = () => {
    setCurrentConversationId(undefined);
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleConversationCreated = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    // Trigger refresh of chat history
    setHistoryRefreshTrigger(prev => prev + 1);
    
    // Auto-open sidebar on desktop to show the new conversation
    if (window.innerWidth >= 768) { // md breakpoint
      setSidebarOpen(true);
    }
  };

  const handleMessageSent = () => {
    // Trigger refresh of chat history to update message counts and last messages
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  const goToAdmin = () => {
    navigate("/admin");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col relative">
      {/* Chat History Sidebar */}
      <ChatHistory
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleStartNewChat}
        currentConversationId={currentConversationId}
        refreshTrigger={historyRefreshTrigger}
      />

      <header className="bg-primary border-b py-4 px-6 relative z-10">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/Logo_Universidad_de_los_Andes.png" 
              alt="Universidad de los Andes" 
              className="h-8 w-auto mr-1"
            />
            <h1 className="text-2xl font-bold text-primary-foreground">
              <span className="text-white">ChatAdmisión</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleGoToHome} className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary">
              Volver al Inicio
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
                {user?.role === 'admin' && (
                  <DropdownMenuItem onClick={goToAdmin}>
                    <Settings className="h-4 w-4 mr-2" />
                    Panel Admin
                  </DropdownMenuItem>
                )}
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
      
      <main className={`flex-grow py-6 transition-all duration-300 ${sidebarOpen ? 'md:ml-80' : 'ml-0'}`}>
        <div className="container">
          <div className="h-[calc(100vh-12rem)]">
            <ChatInterface 
              pdfs={pdfs} 
              onStartNewChat={handleStartNewChat}
              loadConversationId={currentConversationId}
              onConversationCreated={handleConversationCreated}
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>
      </main>
      
      <footer className={`bg-background border-t py-4 px-6 text-center text-sm text-muted-foreground transition-all duration-300 ${sidebarOpen ? 'md:ml-80' : 'ml-0'}`}>
        <div className="container">
          ChatAdmisión - Asistente Virtual
        </div>
      </footer>
    </div>
  );
};

export default Chat;
