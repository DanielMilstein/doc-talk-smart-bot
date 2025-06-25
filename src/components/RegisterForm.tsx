import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('La contraseña no cumple con los requisitos mínimos');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(username, email, password);
      if (success) {
        navigate('/chat');
      }
    } catch (error) {
      setError('Error inesperado al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center space-x-2 text-sm">
      {isValid ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className={isValid ? 'text-green-600' : 'text-red-600'}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            <span className="text-primary">ChatAdmisión</span>
          </CardTitle>
          <CardDescription className="text-center">
            Crea tu cuenta para comenzar
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="mi_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                minLength={3}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 3 caracteres, solo letras, números y guiones bajos
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {password && (
                <div className="space-y-1 p-2 bg-muted rounded">
                  <ValidationItem 
                    isValid={passwordValidation.minLength} 
                    text="Mínimo 8 caracteres" 
                  />
                  <ValidationItem 
                    isValid={passwordValidation.hasNumber} 
                    text="Al menos un número" 
                  />
                  <ValidationItem 
                    isValid={passwordValidation.hasLetter} 
                    text="Al menos una letra" 
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {confirmPassword && (
                <div className="flex items-center space-x-2 text-sm">
                  {doPasswordsMatch ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={doPasswordsMatch ? 'text-green-600' : 'text-red-600'}>
                    {doPasswordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrarse
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/login" 
                className="text-primary hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterForm;