import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, Settings, ArrowLeft, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ChangePasswordForm from '@/components/ChangePasswordForm';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleGoToHome = () => {
    navigate('/');
  };

  const handleGoToChat = () => {
    navigate('/chat');
  };

  const handleGoToAdmin = () => {
    navigate('/admin');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null; // Should not happen due to protected route
  }

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
              <span className="text-white">ChatAdmisión</span> - Perfil
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleGoToHome} className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary">
                  <User className="h-4 w-4 mr-2" />
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleGoToChat}>
                  <User className="h-4 w-4 mr-2" />
                  Ir al Chat
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem onClick={handleGoToAdmin}>
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
      
      <main className="container flex-grow py-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Información del Perfil</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Usuario
                </CardTitle>
                <CardDescription>
                  Detalles de tu cuenta en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Nombre de usuario
                    </label>
                    <p className="text-lg">{user.username}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Correo electrónico
                    </label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Rol del usuario
                    </label>
                    <div className="mt-1">
                      <Badge 
                        variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                        {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Estado de la cuenta
                    </label>
                    <div className="mt-1">
                      <Badge variant={user.is_active ? 'default' : 'destructive'}>
                        {user.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Fecha de registro
                    </label>
                    <p className="text-lg">{formatDate(user.created_at)}</p>
                  </div>
                </div>

                {user.role === 'ADMIN' && (
                  <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Privilegios de Administrador
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Subir y gestionar documentos PDF</li>
                      <li>• Administrar usuarios del sistema</li>
                      <li>• Ver estadísticas del sistema</li>
                      <li>• Gestionar roles y permisos</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Seguridad</CardTitle>
                <CardDescription>
                  Gestiona la seguridad de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showChangePassword ? (
                  <ChangePasswordForm
                    onSuccess={() => setShowChangePassword(false)}
                    onCancel={() => setShowChangePassword(false)}
                  />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Contraseña</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Cambia tu contraseña regularmente para mantener tu cuenta segura.
                      </p>
                      <Button onClick={() => setShowChangePassword(true)}>
                        Cambiar Contraseña
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Sesión Activa</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Cierra tu sesión en todos los dispositivos si sospechas actividad no autorizada.
                      </p>
                      <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-background border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <div className="container">
          Perfil de usuario - {user.username}
        </div>
      </footer>
    </div>
  );
};

export default Profile;