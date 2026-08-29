export type BusinessType = 
  | 'ferreteria_general' 
  | 'deposito_materiales' 
  | 'electricos_plomeria' 
  | 'distribuidora_mayorista';

export type CatalogSize = 'small' | 'medium' | 'large';

export interface RegisterFormData {
  // Paso 1: Datos de la Ferretería
  storeName: string;
  nit: string;
  address: string;
  city: string;
  phone: string;
  businessType: BusinessType;
  
  // Paso 2: Cuenta Administrador
  ownerName: string;
  ownerRole: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Paso 3: Configuración y Equipos POS
  catalogSize: CatalogSize;
  hasBarcodeScanner: boolean;
  hasThermalPrinter: boolean;
  preloadDemoData: boolean;
  acceptTerms: boolean;
}

export type StepNumber = 1 | 2 | 3;
