import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Wrench, Eye, EyeOff, AlertCircle, Crown, CreditCard, Package } from 'lucide-react';
import { useAuth } from './auth-context';
import { useSystemSettings } from './system-settings-context';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { settings: systemSettings } = useSystemSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // La función login ahora es asíncrona y se espera
      await login(username, password);
      // Si el login es exitoso, el AuthProvider se encargará de redirigir
    } catch (err: any) {
      // Si hay un error, lo mostramos al usuario
      setError(err.message || 'Usuario o contraseña incorrectos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener el nombre de la empresa de las configuraciones
  const companyName = systemSettings?.companyName || 'Sistema de Gestión';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de información */}
        <div className="hidden lg:flex flex-col justify-center space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl mx-auto mb-4">
              <Wrench className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyName}</h1>
            <p className="text-lg text-gray-600">Sistema de Gestión e Inventario</p>
          </div>
          
          {/* Credenciales de demo */}
        </div>

        {/* Formulario de login */}
        <div className="flex flex-col justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-xl mx-auto mb-4 lg:hidden">
                <Wrench className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pr-10"
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
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verificando...' : 'Ingresar'}
                </Button>
              </form>

              {/* Info adicional para móvil */}
              <div className="mt-6 lg:hidden">
                <Card className="bg-gray-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Credenciales de Prueba</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Admin:</span> admin / admin123
                      </div>
                      <div>
                        <span className="font-medium">Cajeros:</span> cajero1-2 / caja123
                      </div>
                      <div>
                        <span className="font-medium">Bodega:</span> bodega1-2 / bodega123
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}