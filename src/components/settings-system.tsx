"use client";

import React, { useState, useEffect, useMemo } from 'react'; // <-- Añadir useMemo
// --- CORRECCIÓN 1: Cambiar la importación ---
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner';
import { Users, UserPlus, Edit, Trash2, Crown, CreditCard, Package, Building2 } from 'lucide-react';
import { User, useAuth } from './auth-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

// Interfaces (ya las tienes, esto es para referencia)
interface UserFormData {
  username: string;
  name: string;
  email: string;
  password: string;
  role: 'cajero' | 'bodega' | 'admin';
}
interface EditUserFormData {
  username: string;
  name: string;
  email: string;
  role: 'cajero' | 'bodega' | 'admin';
  password?: string;
}
interface CompanySettings {
  companyName: string;
  companyNit: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  defaultTaxRate: number; // Añadir para el IVA
}

// --- CORRECCIÓN: Añadir un tipo para el perfil de Supabase ---
interface SupabaseProfile {
  user_id: string;
  username: string;
  name: string;
  email: string;
  role: 'cajero' | 'bodega' | 'admin';
}

export function SettingsSystem() {
  // --- CORRECCIÓN: Envolver la creación del cliente en useMemo ---
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('users'); // <--- AÑADIR ESTADO PARA LA PESTAÑA ACTIVA
  // --- ESTA ES LA CORRECCIÓN ---
  // Actualiza el tipo del estado para que 'role' pueda ser 'admin'.
  const [newUserData, setNewUserData] = useState({ username: '', name: '', email: '', password: '', role: 'cajero' as 'cajero' | 'bodega' | 'admin' });
  const [editUserData, setEditUserData] = useState<EditUserFormData>({
    username: '', name: '', email: '', role: 'cajero', password: ''
  });
  // --- AÑADIR ESTADO PARA LA CONFIGURACIÓN DE LA EMPRESA ---
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: '',
    companyNit: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    defaultTaxRate: 16.0, // Valor por defecto
  });

  // --- CORRECCIÓN 1: Añadir useEffect para cargar los usuarios al montar el componente ---
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      // Petición de usuarios
      const usersRes = await fetch('/api/list-users', { credentials: 'include' });
      const usersJson = await usersRes.json();
      if (!usersRes.ok) {
        toast.error('Error al cargar la lista de usuarios.', { description: usersJson.error });
        setAllUsers([]);
      } else {
        const users: User[] = usersJson.users.map((p: any) => ({
          id: p.user_id,
          username: p.username,
          name: p.name,
          email: p.email,
          role: p.role,
          permissions: []
        }));
        setAllUsers(users);
      }

      // --- AÑADIR PETICIÓN PARA CONFIGURACIÓN DE EMPRESA ---
      // Cambiado para leer desde la tabla 'system_settings' con formato clave-valor
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value');
      
      if (settingsError) {
        toast.error('Error al cargar la configuración del sistema.', { description: settingsError.message });
      } else if (settingsData) {
        // Transforma el array de clave-valor en un objeto
        const settings = settingsData.reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as Record<string, string>);

        setCompanySettings({
          companyName: settings.company_name || '',
          companyNit: settings.company_nit || '',
          companyAddress: settings.company_address || '',
          companyPhone: settings.company_phone || '',
          companyEmail: settings.company_email || '',
          defaultTaxRate: parseFloat(settings.default_tax_rate) || 16.0,
        });
      }

      setLoading(false);
    };

    fetchAllData();
  }, [supabase]); // Añadir supabase a las dependencias

  // --- AÑADIR FUNCIÓN PARA GUARDAR LA CONFIGURACIÓN DE LA EMPRESA ---
  const handleSaveCompanySettings = async () => {
    if (user?.role !== 'admin') {
      toast.error('No tienes permiso para realizar esta acción.');
      return;
    }

    try {
      // Array de configuraciones a guardar
      const settingsToSave = [
        { key: 'company_name', value: companySettings.companyName },
        { key: 'default_tax_rate', value: companySettings.defaultTaxRate.toString() },
        { key: 'company_nit', value: companySettings.companyNit },
        { key: 'company_address', value: companySettings.companyAddress },
        { key: 'company_phone', value: companySettings.companyPhone },
        { key: 'company_email', value: companySettings.companyEmail }
      ];

      // Usar upsert para insertar o actualizar cada configuración
      const updatePromises = settingsToSave.map(async (setting) => {
        const { data, error } = await supabase
          .from('system_settings')
          .upsert(
            {
              setting_key: setting.key,
              setting_value: setting.value,
              description: `Configuración de ${setting.key.replace('_', ' ')}`,
              data_type: setting.key === 'default_tax_rate' ? 'number' : 'string',
              is_editable: true,
              updated_at: new Date().toISOString()
            },
            {
              onConflict: 'setting_key'
            }
          );

        if (error) {
          console.error(`Error updating ${setting.key}:`, error);
          throw error;
        }
        return { key: setting.key, success: true, data };
      });

      // Ejecutar todas las promesas
      await Promise.all(updatePromises);

      toast.success('Configuración de la empresa guardada exitosamente.');
      
      // Recargar los datos para reflejar los cambios
      const { data: updatedSettings } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value');
      
      if (updatedSettings) {
        const settings = updatedSettings.reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as Record<string, string>);

        setCompanySettings({
          companyName: settings.company_name || '',
          companyNit: settings.company_nit || '',
          companyAddress: settings.company_address || '',
          companyPhone: settings.company_phone || '',
          companyEmail: settings.company_email || '',
          defaultTaxRate: parseFloat(settings.default_tax_rate) || 16.0,
        });
      }

    } catch (error: any) {
      console.error('Error al guardar configuración:', error);
      toast.error('Error al guardar la configuración.', { 
        description: error.message || 'Ocurrió un error desconocido.' 
      });
    }
  };

  // --- CORRECCIÓN: Reemplazar la lógica para llamar al nuevo API endpoint ---
  const handleAddUser = async () => {
    if (!newUserData.username || !newUserData.name || !newUserData.email || !newUserData.password) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    const body = {
      username: newUserData.username,
      name: newUserData.name,
      email: newUserData.email,
      password: newUserData.password,
      role: newUserData.role
    };

    const response = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error("Error al crear el usuario.", { description: result.error || 'Ocurrió un error.' });
      return;
    }

    toast.success("Usuario creado exitosamente.");
    setAllUsers([...allUsers, {
      id: result.user_id,
      email: body.email,
      username: body.username,
      name: body.name,
      role: body.role,
      permissions: []
    }]);
    setIsAddUserOpen(false);
    setNewUserData({ username: '', name: '', email: '', password: '', role: 'cajero' });
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    // 1) Actualiza perfil
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: editUserData.name,
        username: editUserData.username,
        role: editUserData.role,
        email: editUserData.email
      })
      .eq('user_id', editingUser.id)
      .select()
      .maybeSingle();

    if (error) {
      toast.error('Error al actualizar el usuario.', { description: error.message });
      return;
    }

    // 2) Si el admin escribió una nueva contraseña, actualízala vía API admin
    if (editUserData.password && editUserData.password.length >= 6) {
      const res = await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingUser.id, newPassword: editUserData.password }),
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error('Error al cambiar la contraseña', { description: json.error || 'Fallo admin.updateUserById' });
        return;
      }
    }

    // 3) Refresca UI
    if (data) {
      const updatedUser: User = {
        id: data.user_id,
        username: data.username,
        name: data.name,
        role: data.role,
        email: data.email,
        permissions: [],
      };
      setAllUsers(allUsers.map(u => (u.id === editingUser.id ? updatedUser : u)));
      setEditingUser(null);
      toast.success('Usuario actualizado exitosamente.');
    }
  };

  // --- CORRECCIÓN: Reemplazar la lógica para llamar a la nueva API de eliminación ---
  const handleDeleteUser = async (userToDelete: User) => {
    if (!userToDelete) return;

    // No es necesario obtener el token manualmente. El navegador enviará las cookies.
    const response = await fetch('/api/delete-user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // La cabecera 'Authorization' se elimina.
      },
      body: JSON.stringify({ userIdToDelete: userToDelete.id }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error("Error al eliminar el usuario.", {
        description: result.error || 'Ocurrió un error desconocido.'
      });
    } else {
      toast.success("Usuario eliminado exitosamente.");
      // Actualizar la lista de usuarios en la UI
      setAllUsers(allUsers.filter(u => u.id !== userToDelete.id));
    }
  };

  const openEditDialog = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setEditUserData({
      name: userToEdit.name,
      username: userToEdit.username,
      email: userToEdit.email || '',
      role: userToEdit.role,
      password: ''
    });
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'cajero': return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'bodega': return <Package className="h-4 w-4 text-blue-600" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    // Usar la función oficial de Supabase para actualizar el usuario
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error("Error al cambiar la contraseña.", { description: error.message });
    } else {
      toast.success("Contraseña actualizada exitosamente.");
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (loading) {
    return <div>Cargando configuración...</div>;
  }

  // Si la carga falló y no hay usuarios, muestra un error en lugar de crashear.
  if (!allUsers) {
    return <div>Error al cargar usuarios. Por favor, recarga la página.</div>;
  }

  const adminUsers = (allUsers || []).filter((u) => u.role === 'admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
          <p className="text-muted-foreground">Gestiona usuarios y configuraciones de la ferretería</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger 
            value="users" 
            className={activeTab === 'users' ? 'bg-primary text-primary-foreground' : ''}
          >
            <Users className="h-4 w-4 mr-2" />Gestión de Usuarios
          </TabsTrigger>
          <TabsTrigger 
            value="company" 
            className={activeTab === 'company' ? 'bg-primary text-primary-foreground' : ''}
          >
            <Building2 className="h-4 w-4 mr-2" />Información de Empresa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Usuarios</CardTitle>
              <CardDescription>Gestiona todos los perfiles de usuario del sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsAddUserOpen(true)} className="mb-4">
                <UserPlus className="h-4 w-4 mr-2" /> Agregar Usuario
              </Button>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(allUsers || []).map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell>
                        <div className="font-medium">{userItem.name}</div>
                        <div className="text-sm text-muted-foreground">{userItem.username}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(userItem.role)}
                          <span>{userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(userItem)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que deseas eliminar a {userItem.name}? Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                {/* --- CORRECCIÓN 3: Pasar el usuario directamente a la función --- */}
                                <AlertDialogAction onClick={() => handleDeleteUser(userItem)}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

                <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>
            Actualiza la contraseña de tu propia cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button onClick={handleChangePassword}>
            Actualizar Contraseña
          </Button>
        </CardContent>
      </Card>
        </TabsContent>
        
        {/* --- AÑADIR EL CONTENIDO DE LA PESTAÑA DE EMPRESA --- */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
              <CardDescription>
                Define el nombre y la tasa de IVA por defecto para las facturas.
                {user?.role !== 'admin' && <span className="text-yellow-600 font-bold block mt-2">Solo los administradores pueden editar esta información.</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    value={companySettings.companyName}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                    disabled={user?.role !== 'admin'}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyNit">NIT de la Empresa</Label>
                  <Input
                    id="companyNit"
                    value={companySettings.companyNit}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyNit: e.target.value })}
                    disabled={user?.role !== 'admin'}
                    placeholder="NIT de la empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Teléfono</Label>
                  <Input
                    id="companyPhone"
                    value={companySettings.companyPhone}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyPhone: e.target.value })}
                    disabled={user?.role !== 'admin'}
                    placeholder="Teléfono de la empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companySettings.companyEmail}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyEmail: e.target.value })}
                    disabled={user?.role !== 'admin'}
                    placeholder="Email de la empresa"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress">Dirección</Label>
                  <Input
                    id="companyAddress"
                    value={companySettings.companyAddress}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyAddress: e.target.value })}
                    disabled={user?.role !== 'admin'}
                    placeholder="Dirección de la empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tasa de IVA (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={companySettings.defaultTaxRate}
                    onChange={(e) => setCompanySettings({ ...companySettings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                    disabled={user?.role !== 'admin'}
                    placeholder="16.0"
                  />
                </div>
              </div>
            </CardContent>
            {user?.role === 'admin' && (
              <CardFooter>
                <Button onClick={handleSaveCompanySettings}>Guardar Cambios</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para agregar usuario */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa los campos a continuación para crear un nuevo usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="new-username">Nombre de Usuario</Label>
              <Input id="new-username" value={newUserData.username} onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="new-name">Nombre Completo</Label>
              <Input id="new-name" value={newUserData.name} onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="new-email">Correo Electrónico</Label>
              <Input id="new-email" type="email" value={newUserData.email} onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="new-password">Contraseña</Label>
              <Input id="new-password" type="password" value={newUserData.password} onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="new-role">Rol</Label>
              {/* --- CORRECCIÓN 2: Quitar la prop 'id' del componente Select --- */}
              <Select value={newUserData.role} onValueChange={(value: string) => setNewUserData({ ...newUserData, role: value as 'cajero' | 'bodega' | 'admin' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="cajero">Cajero</SelectItem>
                  <SelectItem value="bodega">Bodega</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddUser}>Agregar Usuario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar usuario */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los campos necesarios y guarda los cambios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="edit-username">Nombre de Usuario</Label>
              <Input id="edit-username" value={editUserData.username} onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-name">Nombre Completo</Label>
              <Input id="edit-name" value={editUserData.name} onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-email">Correo Electrónico</Label>
              <Input id="edit-email" type="email" value={editUserData.email} onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-password">Contraseña</Label>
              <Input id="edit-password" type="password" value={editUserData.password} onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-role">Rol</Label>
              {/* --- CORRECCIÓN 2: Quitar la prop 'id' del componente Select --- */}
              <Select value={editUserData.role} onValueChange={(value: string) => setEditUserData({ ...editUserData, role: value as 'cajero' | 'bodega' | 'admin' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="cajero">Cajero</SelectItem>
                  <SelectItem value="bodega">Bodega</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
            <Button onClick={handleEditUser}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Añade esta nueva tarjeta para cambiar la contraseña */}
    </div>
  );
}