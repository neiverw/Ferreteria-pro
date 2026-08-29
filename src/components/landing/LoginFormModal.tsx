"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-context';

interface LoginFormModalProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function LoginFormModal({ onSuccess, onSwitchToRegister }: LoginFormModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      onSuccess();
      router.push('/app');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Usuario o contraseña incorrectos.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="login-username" className="text-xs font-semibold text-slate-300">
          Usuario
        </Label>
        <Input
          id="login-username"
          type="text"
          placeholder="Ej: admin o carlos_ferre"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading}
          className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-xs font-semibold text-slate-300">
            Contraseña
          </Label>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 pr-10"
          />
          <button
            type="button"
            className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="py-2 text-xs bg-red-950/50 border-red-800 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Verificando...
          </span>
        ) : (
          'Ingresar al Sistema'
        )}
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          ¿Aún no tienes cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-400 hover:underline font-semibold"
          >
            Empieza 14 días gratis
          </button>
        </p>
      </div>
    </form>
  );
}
