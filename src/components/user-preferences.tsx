"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useThemePreferences } from '@/components/theme-provider';
import { toast } from 'sonner';
import { Moon, Sun, Type, Monitor } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function UserPreferences() {
  const { theme, fontSize, setTheme, setFontSize, isLoading } = useThemePreferences();
  const [localTheme, setLocalTheme] = useState(theme);
  const [localFontSize, setLocalFontSize] = useState(fontSize);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  useEffect(() => {
    setLocalFontSize(fontSize);
  }, [fontSize]);

  const handleSave = async () => {
    try {
      console.log('Guardando preferencias:', { theme: localTheme, fontSize: localFontSize });
      
      // Guardar ambas preferencias juntas
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: { theme: localTheme, fontSize: localFontSize }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Error al guardar:', result);
        toast.error('Error al guardar preferencias', { 
          description: result.error || 'Error desconocido' 
        });
        return;
      }

      console.log('Preferencias guardadas en DB:', result);
      
      // Actualizar el theme provider después de guardar exitosamente
      await setTheme(localTheme);
      await setFontSize(localFontSize);
      
      toast.success('Preferencias guardadas exitosamente');
    } catch (error: any) {
      console.error('Error al guardar preferencias:', error);
      toast.error('Error al guardar preferencias', { 
        description: error.message || 'Error desconocido' 
      });
    }
  };

  const hasChanges = localTheme !== theme || localFontSize !== fontSize;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cargando preferencias...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Preferencias de Usuario</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Personaliza la apariencia del sistema según tus preferencias
        </p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-1 max-w-md">
          <TabsTrigger value="appearance">
            <Monitor className="h-4 w-4 mr-2" />
            Apariencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          {/* Tema - Modo Claro/Oscuro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                {localTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Tema del Sistema
              </CardTitle>
              <CardDescription className="text-sm">
                Selecciona si prefieres usar el modo claro u oscuro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl">
                {/* Opción Modo Claro */}
                <button
                  type="button"
                  onClick={() => setLocalTheme('light')}
                  className={`
                    cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all hover:scale-105
                    ${localTheme === 'light' 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-center w-full h-20 sm:h-24 rounded border border-gray-300" style={{ backgroundColor: '#ffffff' }}>
                      <Sun className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm sm:text-base font-medium text-foreground">Modo Claro</p>
                      <p className="text-xs text-muted-foreground">Fondo blanco</p>
                    </div>
                  </div>
                </button>

                {/* Opción Modo Oscuro */}
                <button
                  type="button"
                  onClick={() => setLocalTheme('dark')}
                  className={`
                    cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all hover:scale-105
                    ${localTheme === 'dark' 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-center w-full h-20 sm:h-24 rounded border border-gray-600" style={{ backgroundColor: '#1f2937' }}>
                      <Moon className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: '#60a5fa' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm sm:text-base font-medium text-foreground">Modo Oscuro</p>
                      <p className="text-xs text-muted-foreground">Fondo oscuro</p>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Tamaño de Fuente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Type className="h-5 w-5" />
                Tamaño de Fuente
              </CardTitle>
              <CardDescription className="text-sm">
                Ajusta el tamaño del texto para mejorar la legibilidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl">
                {/* Pequeño */}
                <button
                  type="button"
                  onClick={() => setLocalFontSize('small')}
                  className={`
                    cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all hover:scale-105
                    ${localFontSize === 'small' 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                >
                  <div className="text-center space-y-2">
                    <Type className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-foreground" />
                    <p className="text-xs font-medium text-foreground">Pequeño</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">14px</p>
                  </div>
                </button>

                {/* Mediano */}
                <button
                  type="button"
                  onClick={() => setLocalFontSize('medium')}
                  className={`
                    cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all hover:scale-105
                    ${localFontSize === 'medium' 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                >
                  <div className="text-center space-y-2">
                    <Type className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-foreground" />
                    <p className="text-xs sm:text-sm font-medium text-foreground">Mediano</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">16px</p>
                  </div>
                </button>

                {/* Grande */}
                <button
                  type="button"
                  onClick={() => setLocalFontSize('large')}
                  className={`
                    cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all hover:scale-105
                    ${localFontSize === 'large' 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                >
                  <div className="text-center space-y-2">
                    <Type className="h-6 w-6 sm:h-7 sm:w-7 mx-auto text-foreground" />
                    <p className="text-sm sm:text-base font-medium text-foreground">Grande</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">18px</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setLocalTheme(theme);
                setLocalFontSize(fontSize);
              }}
              disabled={!hasChanges}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="w-full sm:w-auto"
            >
              Guardar Cambios
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
