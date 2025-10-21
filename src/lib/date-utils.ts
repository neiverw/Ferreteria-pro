/**
 * Utilidades para manejo de fechas en zona horaria de Colombia
 */

const COLOMBIA_TIMEZONE = 'America/Bogota';

/**
 * Obtiene la fecha actual en zona horaria de Colombia
 * @returns Date object con fecha/hora de Colombia
 */
export function getColombiaDate(): Date {
  // Crear fecha en zona horaria de Colombia
  const colombiaDateString = new Date().toLocaleString('en-US', {
    timeZone: COLOMBIA_TIMEZONE
  });
  return new Date(colombiaDateString);
}

/**
 * Formatea una fecha en formato local de Colombia (español)
 * @param date - Fecha a formatear (opcional, por defecto usa fecha actual)
 * @param options - Opciones de formato
 * @returns String con la fecha formateada
 */
export function formatColombiaDate(
  date?: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = date ? new Date(date) : getColombiaDate();
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: COLOMBIA_TIMEZONE
  };

  return dateObj.toLocaleDateString('es-CO', { ...defaultOptions, ...options });
}

/**
 * Obtiene la fecha actual en formato ISO (YYYY-MM-DD) en zona horaria de Colombia
 * Útil para guardar en base de datos
 * @returns String en formato YYYY-MM-DD con zona horaria de Colombia
 */
export function getColombiaTodayISO(): string {
  // Usar toLocaleDateString con zona horaria de Colombia
  const parts = new Date().toLocaleDateString('en-CA', { 
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  return parts; // Ya viene en formato YYYY-MM-DD
}

/**
 * Obtiene la fecha y hora actual en formato ISO completo con zona horaria de Colombia
 * Útil para timestamps precisos en base de datos
 * @returns String en formato YYYY-MM-DDTHH:mm:ss
 */
export function getColombiaDateTimeISO(): string {
  const colombiaDate = getColombiaDate();
  const year = colombiaDate.getFullYear();
  const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
  const day = String(colombiaDate.getDate()).padStart(2, '0');
  const hours = String(colombiaDate.getHours()).padStart(2, '0');
  const minutes = String(colombiaDate.getMinutes()).padStart(2, '0');
  const seconds = String(colombiaDate.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Formatea una fecha ISO en formato corto de Colombia
 * @param isoDate - Fecha en formato ISO
 * @returns String con la fecha formateada (DD/MM/YYYY)
 */
export function formatColombiaDateShort(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('es-CO', {
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Obtiene el primer día del mes actual en zona horaria de Colombia
 * Útil para consultas de facturas del mes
 * @returns String en formato YYYY-MM-DD (primer día del mes)
 */
export function getColombiaFirstDayOfMonth(): string {
  const colombiaDate = getColombiaDate();
  const year = colombiaDate.getFullYear();
  const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}
