import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess, onCancel }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { changePassword } = useAuth();

  // Password validation
  const passwordValidation = {
    minLength: newPassword.length >= 8,
    hasNumber: /\d/.test(newPassword),
    hasLetter: /[a-zA-Z]/.test(newPassword),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!isPasswordValid) {
      setError('La nueva contraseña no cumple con los requisitos mínimos');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (onSuccess) {
          setTimeout(onSuccess, 1500); // Give user time to see success message
        }
      }
    } catch (error) {
      setError('Error inesperado al cambiar contraseña');
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cambiar Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu contraseña actual y elige una nueva
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Contraseña cambiada exitosamente
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña actual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Tu contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={isLoading}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {newPassword && (
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
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirma tu nueva contraseña"
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

          <div className="flex space-x-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cambiar Contraseña
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </form>
    </Card>
  );
};

export default ChangePasswordForm;