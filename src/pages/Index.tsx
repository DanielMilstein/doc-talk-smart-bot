
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const goToChat = () => {
    navigate("/chat");
  };
  
  const goToAdmin = () => {
    navigate("/admin");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  const goToRegister = () => {
    navigate("/register");
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="bg-primary border-b py-4 px-6">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-foreground">
            <span className="text-white">ChatAdmisión</span>
          </h1>
          
          {isAuthenticated ? (
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
          ) : (
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={goToLogin} className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary">
                Iniciar sesión
              </Button>
              <Button size="sm" onClick={goToRegister} className="bg-primary-foreground text-primary hover:bg-white hover:text-primary">
                Registrarse
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main className="container flex-grow py-6">
        <div className="flex flex-col items-center justify-center space-y-8 h-[70vh]">
          <h2 className="text-3xl font-bold">
            {isAuthenticated ? `¡Hola, ${user?.username}!` : 'Bienvenido a ChatAdmisión'}
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            {isAuthenticated 
              ? 'Puedes comenzar a chatear o administrar documentos según tus permisos.'
              : 'Pregunta tus dudas sobre el proceso de admisión y obtén respuestas rápidas y precisas. Inicia sesión para comenzar.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              <>
                <Button size="lg" onClick={goToChat}>
                  Empezar chat
                </Button>
                {user?.role === 'ADMIN' && (
                  <Button size="lg" variant="outline" onClick={goToAdmin}>
                    Panel de administración
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button size="lg" onClick={goToLogin}>
                  Iniciar sesión
                </Button>
                <Button size="lg" variant="outline" onClick={goToRegister}>
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-background border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <div className="container">
          Inicio
        </div>
      </footer>
    </div>
  );
};

export default Index;
