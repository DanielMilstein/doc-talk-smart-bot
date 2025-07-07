import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  UserPlus, 
  MoreVertical, 
  Shield, 
  ShieldOff, 
  UserCheck, 
  UserX,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, User } from '@/services/apiClient';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserUsername || !newUserEmail || !newUserPassword) {
      toast.error('Nombre de usuario, email y contraseña son requeridos');
      return;
    }

    setCreatingUser(true);
    try {
      const response = await apiClient.createUser(newUserUsername, newUserEmail, newUserPassword, newUserRole);
      if (response.success && response.data) {
        toast.success('Usuario creado exitosamente');
        setUsers(prev => [...prev, response.data.user]);
        setCreateUserOpen(false);
        setNewUserUsername('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
    } finally {
      setCreatingUser(false);
    }
  };

  const handlePromoteUser = async (userId: string) => {
    try {
      const response = await apiClient.promoteUser(userId);
      if (response.success) {
        toast.success('Usuario promovido a administrador');
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: 'admin' } : user
        ));
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Error al promover usuario');
    }
  };

  const handleDemoteUser = async (userId: string) => {
    try {
      const response = await apiClient.demoteUser(userId);
      if (response.success) {
        toast.success('Usuario degradado a usuario regular');
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: 'user' } : user
        ));
      }
    } catch (error) {
      console.error('Error demoting user:', error);
      toast.error('Error al degradar usuario');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const response = await apiClient.activateUser(userId);
      if (response.success) {
        toast.success('Usuario activado');
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, is_active: true } : user
        ));
      }
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Error al activar usuario');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      const response = await apiClient.deactivateUser(userId);
      if (response.success) {
        toast.success('Usuario desactivado');
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, is_active: false } : user
        ));
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Error al desactivar usuario');
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
          <p className="text-sm text-muted-foreground">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        
        <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Crea un nuevo usuario del sistema con nombre de usuario, email y contraseña
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="mi_usuario"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  minLength={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña del usuario"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <select
                  id="role"
                  className="w-full p-2 border rounded-md"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateUserOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser} disabled={creatingUser}>
                {creatingUser && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear Usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No hay usuarios registrados en el sistema.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de registro</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'destructive'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.role === 'user' ? (
                              <DropdownMenuItem onClick={() => handlePromoteUser(user.id)}>
                                <Shield className="h-4 w-4 mr-2" />
                                Promover a Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleDemoteUser(user.id)}>
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Degradar a Usuario
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {user.is_active ? (
                              <DropdownMenuItem 
                                onClick={() => handleDeactivateUser(user.id)}
                                className="text-destructive"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Desactivar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleActivateUser(user.id)}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;