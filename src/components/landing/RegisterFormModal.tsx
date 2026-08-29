"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-context';

interface RegisterFormModalProps {
  initialPlan?: 'basico' | 'pro' | 'empresarial';
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterFormModal({ initialPlan = 'pro', onSuccess, onSwitchToLogin }: RegisterFormModalProps) {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<'basico' | 'pro' | 'empresarial'>(initialPlan);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          name: ownerName,
          username: username.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          password,
          plan,
          role: 'admin',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo completar el registro.');
      }

      // Auto login after successful account creation
      await login(username.toLowerCase().trim(), password);
      onSuccess();
      router.push('/app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al registrar la cuenta.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">Nombre de la Ferretería</Label>
          <Input
            placeholder="Ej: Ferretería El Martillo"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            disabled={isLoading}
            className="bg-slate-900 border-slate-700 text-white text-xs h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">Tu Nombre Completo</Label>
          <Input
            placeholder="Ej: Carlos Andrés Meza"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
            disabled={isLoading}
            className="bg-slate-900 border-slate-700 text-white text-xs h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">Usuario Administrador</Label>
          <Input
            placeholder="Ej: admin_ferre"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className="bg-slate-900 border-slate-700 text-white text-xs h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">Correo Electrónico</Label>
          <Input
            type="email"
            placeholder="ejemplo@ferreteria.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="bg-slate-900 border-slate-700 text-white text-xs h-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-300">Contraseña Segura</Label>
        <Input
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={isLoading}
          className="bg-slate-900 border-slate-700 text-white text-xs h-9"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-300">Plan de Suscripción (14 días gratis)</Label>
        <div className="grid grid-cols-3 gap-2">
          {(['basico', 'pro', 'empresarial'] as const).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPlan(p)}
              className={`rounded-lg p-2 text-center text-xs font-bold transition-all border ${
                plan === p
                  ? 'border-blue-500 bg-blue-600/20 text-blue-300 shadow-sm'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="capitalize">{p === 'pro' ? 'Ferre-PRO' : p}</div>
              <div className="text-[10px] font-normal text-slate-400">{p === 'pro' ? 'Popular' : 'Plan'}</div>
            </button>
          ))}
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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 font-bold text-xs sm:text-sm mt-2 shadow-lg shadow-blue-600/20"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta y configurando ferretería...
          </span>
        ) : (
          'Comenzar Prueba Gratuita (14 Días)'
        )}
      </Button>

      <p className="text-center text-xs text-slate-400">
        ¿Ya tienes tu cuenta configurada?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-400 hover:underline font-semibold"
        >
          Inicia sesión aquí
        </button>
      </p>
    </form>
  );
}
