# Contrato Telegram → Jarvis → Renzo Hub

La entrada de Jarvis está en `POST /api/jarvis` y requiere `Authorization: Bearer <JARVIS_INBOUND_TOKEN>`. No se guarda el token en este repositorio.

## Gasto

Enviar la extracción normalizada de Telegram con un identificador estable del mensaje para que los reintentos no dupliquen movimientos:

```json
{
  "type": "expense",
  "eventId": "telegram-update-id",
  "title": "Gasolina",
  "note": "Shell, pago con tarjeta",
  "date": "2026-10-07",
  "confidence": 0.97,
  "extracted": {
    "amount": 64.20,
    "expenseCategory": "car",
    "category": "Car"
  }
}
```

Con importe positivo y confianza de al menos 0,90, el registro aparece automáticamente en Money; si la categoría es `car`, también aparece en Car. Si falta un dato o la confianza es inferior, Jarvis lo deja en AI Inbox para confirmar.

## Nómina

El agente debe enviar `type: "payslip"`, `eventId`, título, fecha de pago, confianza de extracción de al menos 0,90 y estos campos normalizados en `extracted`: `net`, `gross`, `period` (YYYY-MM), y opcionalmente `baseHours`, `overtimeHours`, `overtimeIncome`, `allowances`, `bonus`, `deductions` y `fuel`. Solo una nómina con neto, bruto y período se registra automáticamente. Las extracciones incompletas van a AI Inbox; al confirmarlas, se añaden a Money.

## Configuración de producción pendiente

- La configuración segura requiere `JARVIS_INBOUND_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY` y `JARVIS_OWNER_ID` en Vercel Production.
- El workflow de Telegram debe estar publicado y llamar a `/api/jarvis` con el token de entrada.
- `GET /api/jarvis` confirma el estado sin revelar secretos. En la última comprobación, entrada y salida estaban desactivadas en Producción.
- No enviar nóminas reales para probar. Primero verificar el recorrido con un gasto y una nómina ficticios.
