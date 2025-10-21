// Script de prueba para verificar fechas

const COLOMBIA_TIMEZONE = 'America/Bogota';

function getColombiaDate() {
  const colombiaDateString = new Date().toLocaleString('en-US', {
    timeZone: COLOMBIA_TIMEZONE
  });
  return new Date(colombiaDateString);
}

function getColombiaTodayISO_OLD() {
  const colombiaDate = getColombiaDate();
  const year = colombiaDate.getFullYear();
  const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
  const day = String(colombiaDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getColombiaTodayISO_NEW() {
  const parts = new Date().toLocaleDateString('en-CA', { 
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return parts;
}

console.log('=== PRUEBA DE FECHAS ===');
console.log('Fecha/hora del sistema:', new Date().toString());
console.log('Fecha/hora UTC:', new Date().toUTCString());
console.log('Fecha/hora Colombia:', getColombiaDate().toString());
console.log('');
console.log('MÉTODO ANTERIOR:', getColombiaTodayISO_OLD());
console.log('MÉTODO NUEVO:   ', getColombiaTodayISO_NEW());
console.log('========================');
