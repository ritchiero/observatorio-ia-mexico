# Configuración de Cron Jobs

Este proyecto utiliza **Vercel Cron Jobs** para ejecutar automáticamente los agentes de detección y monitoreo.

## Configuración Actual

### 1. Agente de Detección
- **Endpoint**: `/api/cron/deteccion`
- **Frecuencia**: Lunes a las 10:00 AM (hora del servidor)
- **Schedule**: `0 10 * * 1`
- **Función**: Buscar nuevos anuncios de IA del gobierno mexicano

### 2. Agente de Monitoreo
- **Endpoint**: `/api/cron/monitoreo`
- **Frecuencia**: Miércoles y viernes a las 2:00 PM (hora del servidor)
- **Schedule**: `0 14 * * 3,5`
- **Función**: Actualizar el estado de anuncios existentes

## Formato de Schedule (Cron Expression)

```
┌───────────── minuto (0 - 59)
│ ┌───────────── hora (0 - 23)
│ │ ┌───────────── día del mes (1 - 31)
│ │ │ ┌───────────── mes (1 - 12)
│ │ │ │ ┌───────────── día de la semana (0 - 6) (0 = domingo)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Ejemplos:
- `0 10 * * 1` - Lunes a las 10:00 AM
- `0 14 * * 3,5` - Miércoles y viernes a las 2:00 PM
- `0 9 1 * *` - Primer día de cada mes a las 9:00 AM
- `0 */6 * * *` - Cada 6 horas

## Variables de Entorno Requeridas

### CRON_SECRET
**Propósito**: Autenticar las peticiones de Vercel Cron para evitar ejecuciones no autorizadas.

**Configuración**:
1. Generar un string aleatorio de 32 caracteres:
   ```bash
   openssl rand -base64 32
   ```

2. Agregar a Vercel:
   - Ir a Settings → Environment Variables
   - Agregar `CRON_SECRET` con el valor generado
   - Aplicar a todos los environments (Production, Preview, Development)

3. Agregar a `.env.local` para desarrollo:
   ```
   CRON_SECRET=tu_string_aleatorio_de_32_caracteres
   ```

## Verificación de Cron Jobs en Vercel

### Ver Logs de Ejecución
1. Ir al dashboard de Vercel
2. Seleccionar el proyecto
3. Ir a "Deployments" → Seleccionar deployment actual
4. Ir a "Logs" → Filtrar por "cron"

### Ver Schedule Configurado
1. Ir a Settings → Cron Jobs
2. Ver lista de cron jobs activos
3. Ver última ejecución y próxima ejecución programada

## Ejecución Manual (Para Testing)

### Desde el Panel de Admin
1. Ir a `/admin?key=demo`
2. Hacer clic en "Ejecutar Detección" o "Ejecutar Monitoreo"

### Desde la Terminal (con curl)
```bash
# Detección
curl -X GET https://tu-dominio.vercel.app/api/cron/deteccion \
  -H "Authorization: Bearer $CRON_SECRET"

# Monitoreo
curl -X GET https://tu-dominio.vercel.app/api/cron/monitoreo \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Limitaciones de Vercel Cron

### Plan Hobby (Gratis)
- ❌ Cron jobs NO disponibles
- Alternativa: Usar servicios externos como cron-job.org

### Plan Pro
- ✅ Cron jobs disponibles
- ✅ Hasta 100 ejecuciones por día
- ✅ Timeout de hasta 5 minutos por ejecución

## Alternativa: GitHub Actions (Gratis)

Si no tienes plan Pro de Vercel, puedes usar GitHub Actions:

```yaml
# .github/workflows/cron.yml
name: Ejecutar Agentes

on:
  schedule:
    - cron: '0 10 * * 1'  # Detección: Lunes 10am
    - cron: '0 14 * * 3,5'  # Monitoreo: Miércoles y viernes 2pm

jobs:
  ejecutar-agentes:
    runs-on: ubuntu-latest
    steps:
      - name: Ejecutar Detección
        if: github.event.schedule == '0 10 * * 1'
        run: |
          curl -X GET https://tu-dominio.vercel.app/api/cron/deteccion \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
      
      - name: Ejecutar Monitoreo
        if: github.event.schedule == '0 14 * * 3,5'
        run: |
          curl -X GET https://tu-dominio.vercel.app/api/cron/monitoreo \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Alternativa: cron-job.org (Gratis)

1. Crear cuenta en https://cron-job.org
2. Crear nuevo cron job:
   - URL: `https://tu-dominio.vercel.app/api/cron/deteccion`
   - Schedule: Lunes 10:00 AM
   - Headers: `Authorization: Bearer TU_CRON_SECRET`
3. Repetir para monitoreo

## Monitoreo y Alertas

### Ver Resultados de Ejecución
Los resultados se guardan en Firestore:
- Colección `agenteLogs`: Logs de cada ejecución
- Colección `actividad`: Timeline de actividades

### Configurar Alertas (Opcional)
Puedes configurar alertas en Vercel para recibir notificaciones cuando:
- Un cron job falla
- Un cron job tarda más de X tiempo
- Se detectan errores en los logs

## Troubleshooting

### Cron job no se ejecuta
1. Verificar que `CRON_SECRET` esté configurado en Vercel
2. Verificar que el schedule sea válido
3. Verificar logs de Vercel para errores

### Error 401 Unauthorized
- El `CRON_SECRET` no coincide
- Verificar que esté configurado correctamente en Vercel

### Timeout
- Los agentes tardan más de 5 minutos (límite de Vercel)
- Considerar optimizar las búsquedas de Claude
- Dividir el monitoreo en lotes más pequeños

## Recomendaciones

1. **Monitorear logs regularmente** para detectar errores temprano
2. **Ajustar frecuencia** según necesidad (más frecuente cerca de fechas importantes)
3. **Configurar alertas** para estar al tanto de fallos
4. **Revisar costos** de API de Claude (cada ejecución consume créditos)
5. **Backup manual** ejecutar agentes manualmente antes de eventos importantes
