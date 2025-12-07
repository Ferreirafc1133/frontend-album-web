# BadgeUp

**Colecciona el mundo, un sticker a la vez**

BadgeUp es una aplicación web de colección de stickers digitales que combina elementos de Pokémon GO con Google Fotos y reconocimiento de imágenes mediante IA. Diseñada para personas curiosas, activas y apasionadas por coleccionar, BadgeUp convierte tus experiencias del mundo real en una colección digital de recuerdos gamificados.

## Tabla de Contenidos

- [Características Principales](#características-principales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Desarrollo Local](#desarrollo-local)
- [Despliegue en Producción](#despliegue-en-producción)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionalidades Detalladas](#funcionalidades-detalladas)
- [API Endpoints](#api-endpoints)
- [Variables de Entorno](#variables-de-entorno)
- [Problemas Conocidos y Limitaciones](#problemas-conocidos-y-limitaciones)
- [Roadmap](#roadmap)
- [Licencia](#licencia)

---

## Características Principales

### Funcionalidades Actuales
- **Colección de Stickers Inteligente**: Sube fotos del mundo real y desbloquea stickers mediante validación con IA (OpenAI Vision)
- **Reconocimiento de Imágenes**: Sistema de validación automática que identifica objetos (actualmente enfocado en automóviles)
- **Sistema de Puntos y Rankings**: Gana puntos por cada sticker desbloqueado y compite en el leaderboard global
- **Geolocalización**: Guarda la ubicación exacta donde capturaste cada recuerdo
- **Mensajes Personalizados**: Añade notas y recuerdos a cada sticker desbloqueado
- **Autenticación con Google OAuth**: Login seguro y rápido con tu cuenta de Google
- **Notificaciones en Tiempo Real**: Sistema de WebSocket para actualizaciones instantáneas
- **Chat entre Usuarios**: Comunícate con otros coleccionistas en tiempo real

### Flujo de Usuario
1. El usuario inicia sesión con Google OAuth
2. Explora sus álbumes de colección (actualmente: automóviles)
3. Captura una foto de un objeto del mundo real
4. Sube la foto a la aplicación
5. El sistema valida la imagen con OpenAI Vision:
   - ✅ **Match encontrado**: Desbloquea el sticker, guarda ubicación y mensaje, suma puntos
   - ⚠️ **Objeto reconocido sin sticker**: Identifica qué es pero no hay sticker disponible aún
   - ❌ **No reconocido**: Informa que no pudo identificar el objeto
6. Visualiza su colección completa con todos los recuerdos geolocalizados

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│              React 19 + React Router 7 + Vite                   │
│                   https://badgeup.duckdns.org                   │
│                                                                  │
│  • UI/UX con TailwindCSS 4                                      │
│  • Mapas interactivos (Mapbox GL)                               │
│  • Estado global (Zustand)                                      │
│  • WebSocket client para real-time                              │
└────────────┬─────────────────────────────────────────────────────┘
             │
             │ HTTPS/WSS
             │
┌────────────▼─────────────────────────────────────────────────────┐
│                          NGINX                                   │
│                    Reverse Proxy + SSL                          │
│                   (Let's Encrypt SSL/TLS)                       │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ├─────────────────────────────────────────────────────┐
             │                                                      │
┌────────────▼──────────┐                    ┌────────────────────▼┐
│   BACKEND (Django)    │                    │  CELERY WORKER      │
│  Django 4.2 + DRF     │◄───────Redis───────┤                     │
│  Channels + Uvicorn   │                    │  • Validación IA    │
│                       │                    │  • Tareas async     │
│  • API REST           │                    └─────────────────────┘
│  • WebSocket server   │
│  • Auth (JWT)         │
└───────┬───────────────┘
        │
        ├─────────────┬──────────────┬─────────────────┐
        │             │              │                 │
┌───────▼────┐  ┌────▼─────┐  ┌────▼──────┐   ┌─────▼──────┐
│ PostgreSQL │  │  Redis   │  │ OpenAI    │   │  Mapbox    │
│    15      │  │  Alpine  │  │  Vision   │   │    API     │
│            │  │          │  │    API    │   │            │
└────────────┘  └──────────┘  └───────────┘   └────────────┘
```

### Despliegue en AWS
- **EC2 Instance**: Instancia ejecutando todos los servicios en Docker
- **DuckDNS**: Servicio de DNS dinámico gratuito para `badgeup.duckdns.org`
- **Docker Compose**: Orquestación de 5 contenedores (frontend, backend, celery, postgres, redis)
- **Security Groups**: Puertos abiertos: 80, 443, 8000, 5173

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.1.1 | Framework UI |
| React Router | 7.9.2 | Enrutamiento y SSR |
| Vite | 7.1.7 | Build tool y dev server |
| TypeScript | 5.9.2 | Type safety |
| TailwindCSS | 4.1.13 | Estilos y diseño |
| Zustand | 4.5.5 | Estado global |
| Axios | 1.7.9 | Cliente HTTP |
| Mapbox GL | 3.16.0 | Mapas interactivos |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.11 | Lenguaje base |
| Django | 4.2.11 | Framework web |
| Django REST Framework | 3.15.1 | API REST |
| Django Channels | 4.1.0 | WebSocket support |
| SimpleJWT | 5.3.1 | Autenticación JWT |
| Celery | 5.3.6 | Procesamiento asíncrono |
| Uvicorn | 0.30.0 | ASGI server |
| PostgreSQL | 15 | Base de datos |
| Redis | Alpine | Cache y message broker |
| OpenAI SDK | 1.45.0 | Validación de imágenes con IA |
| Pillow | 10.3.0 | Procesamiento de imágenes |

### Infraestructura
- **Docker & Docker Compose**: Contenedorización completa
- **Nginx**: Reverse proxy y SSL termination
- **AWS EC2**: Servidor de producción
- **DuckDNS**: DNS dinámico gratuito
- **Let's Encrypt**: Certificados SSL/TLS

---

## Requisitos Previos

### Para Desarrollo Local
- **Docker Desktop** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**
- **Node.js 18+** (opcional, si quieres ejecutar frontend sin Docker)
- **Python 3.11+** (opcional, si quieres ejecutar backend sin Docker)

### Cuentas y API Keys Necesarias
- [OpenAI API Key](https://platform.openai.com/api-keys) - Para validación de imágenes
- [Mapbox Access Token](https://account.mapbox.com/access-tokens/) - Para mapas
- [Google Cloud Console](https://console.cloud.google.com/) - Para OAuth (ya configurado)

---

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd frontend-album-web
```

### 2. Configurar Variables de Entorno

#### Backend (`Badgeup/.env`)
```bash
cd Badgeup
cp .env.example .env
```
---

## Desarrollo Local

### Opción 1: Con Docker (Recomendado)

#### Levantar todos los servicios
```bash
# Desde la raíz del proyecto
docker-compose up --build
```

Esto levanta 5 contenedores:
- **frontend**: http://localhost:5173
- **backend**: http://localhost:8000
- **celery**: Worker en background
- **db**: PostgreSQL en puerto 5432
- **redis**: Redis en puerto 6379

#### Comandos útiles
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Acceder al shell de Django
docker-compose exec backend python manage.py shell

# Reiniciar un servicio
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Borra la BD)
docker-compose down -v
```

### Opción 2: Sin Docker (Desarrollo Manual)

#### Backend
```bash
cd Badgeup

# Crear virtualenv
python3 -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables (asegúrate de tener PostgreSQL y Redis corriendo)
export DJANGO_DEBUG=True
export POSTGRES_HOST=localhost
# ... otras variables necesarias

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Levantar servidor
uvicorn badgeup.asgi:application --host 0.0.0.0 --port 8000 --ws websockets

# En otra terminal: Levantar Celery worker
celery -A badgeup worker -l info
```

#### Frontend
```bash
cd frontend-album

# Instalar dependencias
npm install

# Levantar servidor de desarrollo
npm run dev

# Acceder en http://localhost:5173
```

---

## Despliegue en Producción

### Configuración Actual en AWS EC2

#### 1. Servidor EC2
```bash
# Conectar a la instancia EC2 no se los pasaeremos, tengo puesta mi tarjeta
ssh -i llave.pem ubuntu@<IP-PUBLICA>

# Navegar al proyecto
cd ~/frontend-album-web
```

#### 2. Actualizar el Código
```bash
# Bajar últimos cambios desde Git
git pull origin main

# Reconstruir y reiniciar contenedores
docker-compose down
docker-compose up --build -d
```

#### 3. Verificar Estado
```bash
# Ver contenedores corriendo
docker-compose ps

# Ver logs
docker-compose logs -f

# Verificar salud de servicios
curl https://badgeup.duckdns.org/api/
```

### Configuración de Nginx

El servidor usa Nginx como reverse proxy. La configuración típica incluye:

```nginx
# Ejemplo de configuración
server {
    listen 80;
    server_name badgeup.duckdns.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name badgeup.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/badgeup.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/badgeup.duckdns.org/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### DuckDNS Setup

1. Crear cuenta en [DuckDNS](https://www.duckdns.org/)
2. Crear dominio: `badgeup.duckdns.org`
3. Configurar en el servidor EC2 para actualizar la IP automáticamente

### SSL/TLS con Let's Encrypt

Los certificados SSL están configurados (método específico no documentado - configurado por el equipo de DevOps).

### Security Groups de AWS

Puertos abiertos en el Security Group:
- **22** (SSH)
- **80** (HTTP)
- **443** (HTTPS)
- **8000** (Backend - opcional, normalmente cerrado)
- **5173** (Frontend - opcional, normalmente cerrado)

---

## Estructura del Proyecto

```
frontend-album-web/
├── frontend-album/                    # Aplicación React
│   ├── app/
│   │   ├── components/                # Componentes reutilizables
│   │   │   ├── NotificationsSocket.tsx
│   │   │   ├── PrivateRoute.tsx
│   │   │   └── ...
│   │   ├── routes/                    # Páginas/Rutas
│   │   │   ├── _index.tsx             # Landing page
│   │   │   ├── login.tsx              # Autenticación
│   │   │   ├── album.$id.tsx          # Vista de álbum
│   │   │   ├── perfil.tsx             # Perfil de usuario
│   │   │   ├── ranking.tsx            # Leaderboard
│   │   │   ├── chat.$id.tsx           # Chat individual
│   │   │   ├── notificaciones.tsx     # Centro de notificaciones
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.ts                 # Cliente Axios configurado
│   │   ├── store/
│   │   │   └── authStore.ts           # Estado global (Zustand)
│   │   ├── ui/                        # Componentes UI base
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── main.tsx                   # Entry point
│   │   ├── root.tsx                   # Layout principal
│   │   └── app.css                    # Estilos globales
│   ├── public/                        # Assets estáticos
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── Badgeup/                           # Backend Django
│   ├── badgeup/                       # Configuración principal
│   │   ├── settings.py                # Configuración Django
│   │   ├── urls.py                    # URLs principales
│   │   ├── asgi.py                    # ASGI app (WebSocket)
│   │   ├── wsgi.py                    # WSGI app
│   │   ├── routing.py                 # WebSocket routing
│   │   └── celery.py                  # Configuración Celery
│   ├── users/                         # App de usuarios
│   │   ├── models.py                  # Modelo User personalizado
│   │   ├── views.py                   # Auth, perfil, leaderboard
│   │   ├── serializers.py             # Serializers DRF
│   │   ├── urls.py
│   │   └── consumers.py               # WebSocket consumers
│   ├── albums/                        # App de álbumes
│   │   ├── models.py                  # Album, Sticker
│   │   ├── views.py                   # CRUD de álbumes
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── achievements/                  # App de logros/stickers
│   │   ├── models.py                  # UserSticker
│   │   ├── views.py                   # Unlock stickers
│   │   ├── tasks.py                   # Tareas Celery
│   │   ├── services.py                # Lógica OpenAI Vision
│   │   └── urls.py
│   ├── media/                         # Archivos subidos por usuarios
│   ├── static/                        # Archivos estáticos
│   ├── staticfiles/                   # Estáticos compilados
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── requirements.txt
│   ├── .env
│   ├── .env.example
│   └── manage.py
│
├── docker-compose.yml                 # Orquestación completa
├── .gitignore
└── README.md                          # Este archivo
```

---

## Funcionalidades Detalladas

### 1. Sistema de Autenticación

#### Login con Google OAuth
- Flujo OAuth 2.0 completo
- Tokens JWT (access + refresh)
- Sesión persistente con `localStorage`
- Rutas protegidas con `PrivateRoute`

#### Endpoints:
```
POST /api/auth/register/          # Registro manual (opcional)
POST /api/auth/login/             # Login manual
POST /api/auth/google/            # Iniciar OAuth Google
GET  /api/auth/google/callback/   # Callback OAuth
POST /api/auth/token/refresh/     # Refrescar access token
GET  /api/auth/profile/           # Obtener perfil
PATCH /api/auth/profile/          # Actualizar perfil
```

### 2. Sistema de Álbumes y Stickers

#### Modelos:
- **Album**: Colección temática (ej: "Carros Deportivos")
- **Sticker**: Item individual (ej: "Dodge Charger SRT Hellcat 2015-2023")
  - `name`: Nombre del sticker
  - `description`: Descripción
  - `image_reference`: Imagen de referencia para validación
  - `reward_points`: Puntos que otorga al desbloquearse
  - `location_required`: Si requiere geolocalización
  - `album`: ForeignKey al álbum

#### Endpoints:
```
GET  /api/albums/                 # Listar álbumes
GET  /api/albums/{id}/            # Detalle de álbum con stickers
GET  /api/albums/stickers/{id}/   # Detalle de sticker individual
```

### 3. Sistema de Desbloqueo y Validación

#### Flujo Completo:
1. **Frontend**: Usuario selecciona sticker y sube foto
   ```typescript
   POST /api/stickers/{id}/unlock/
   FormData: {
     photo: File,
     latitude: number,
     longitude: number,
     user_message: string
   }
   ```

2. **Backend**: Crea `UserSticker` y dispara tarea Celery
   ```python
   user_sticker = UserSticker.objects.create(
       user=request.user,
       sticker=sticker,
       photo=uploaded_file,
       status='pending'
   )
   validate_user_sticker.delay(user_sticker.id)
   ```

3. **Celery Worker**: Valida con OpenAI Vision
   ```python
   # achievements/services.py
   def analyze_user_sticker(user_sticker_id):
       # 1. Preparar prompt con datos del sticker
       # 2. Enviar imagen de referencia + foto de usuario a OpenAI
       # 3. Parsear respuesta JSON: {match_score, is_match, reason}
       # 4. Actualizar UserSticker:
       #    - approved/rejected
       #    - validation_score
       #    - validation_notes
       # 5. Si approved: sumar puntos al usuario
   ```

4. **Frontend**: Recibe actualización vía WebSocket o polling

#### Modelo UserSticker:
```python
class UserSticker(models.Model):
    user = ForeignKey(User)
    sticker = ForeignKey(Sticker)
    photo = ImageField()
    latitude = DecimalField(null=True)
    longitude = DecimalField(null=True)
    user_message = TextField(blank=True)
    status = CharField(choices=['pending', 'approved', 'rejected'])
    validation_score = FloatField(null=True)  # 0.0 - 1.0
    validation_notes = TextField(blank=True)
    unlocked_at = DateTimeField(auto_now_add=True)
```

### 4. Sistema de Puntos y Ranking

#### Leaderboard
```
GET /api/auth/leaderboard/
Response: [
  {
    "username": "juan_carspotter",
    "total_points": 1850,
    "unlocked_count": 37
  },
  ...
]
```

#### Cálculo de Puntos:
- Cada sticker tiene `reward_points` (ej: 50 puntos)
- Se suman al `User.total_points` al aprobar validación
- Ranking ordenado por `total_points DESC`

### 5. WebSocket (Notificaciones & Chat)

#### Consumers:
- **NotificationConsumer**: `/ws/notifications/`
  - Notificaciones de stickers desbloqueados
  - Eventos del sistema

- **ChatConsumer**: `/ws/chat/{chat_id}/`
  - Mensajes en tiempo real
  - Indicadores de "escribiendo..."

#### Uso en Frontend:
```typescript
// app/components/NotificationsSocket.tsx
const ws = new WebSocket(`${WS_URL}/ws/notifications/`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Mostrar notificación
};
```

### 6. Geolocalización con Mapbox

#### Captura de Ubicación:
```typescript
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  // Enviar al backend con el desbloqueo
});
```

#### Visualización en Mapa:
- Mapbox GL integrado
- Marcadores en ubicaciones de stickers desbloqueados
- Clusters para múltiples puntos cercanos

---

## API Endpoints

### Autenticación
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | No | Registro de usuario |
| POST | `/api/auth/login/` | No | Login (username/password) |
| POST | `/api/auth/google/` | No | Iniciar OAuth Google |
| GET | `/api/auth/google/callback/` | No | Callback OAuth |
| POST | `/api/auth/token/refresh/` | No | Refrescar JWT |
| GET | `/api/auth/profile/` | Sí | Obtener perfil |
| PATCH | `/api/auth/profile/` | Sí | Actualizar perfil |
| GET | `/api/auth/leaderboard/` | No | Top usuarios |

### Álbumes
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/albums/` | Sí | Listar álbumes |
| GET | `/api/albums/{id}/` | Sí | Detalle + stickers |
| GET | `/api/albums/stickers/{id}/` | Sí | Detalle sticker |

### Stickers
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/stickers/{id}/unlock/` | Sí | Subir foto para validación |
| GET | `/api/stickers/my-collection/` | Sí | Stickers del usuario |

### Admin (Django Admin)
```
GET /admin/   # Panel de administración (requiere superuser)
```

---

## Variables de Entorno

### Backend (Badgeup/.env)

#### Django Core
```env
DJANGO_SECRET_KEY=<string>              # Secret key de Django (CAMBIAR EN PROD)
DJANGO_DEBUG=<True|False>               # Debug mode (False en producción)
DJANGO_ALLOWED_HOSTS=<hosts>            # Hosts permitidos (separados por coma)
DJANGO_CSRF_TRUSTED_ORIGINS=<origins>   # Orígenes CSRF confiables
DJANGO_TIME_ZONE=UTC                    # Zona horaria
```

#### Base de Datos
```env
POSTGRES_DB=badgeup                     # Nombre de la BD
POSTGRES_USER=badgeup                   # Usuario de PostgreSQL
POSTGRES_PASSWORD=<password>            # Contraseña (CAMBIAR EN PROD)
POSTGRES_HOST=db                        # Host (db para Docker, localhost para local)
POSTGRES_PORT=5432                      # Puerto de PostgreSQL
```

#### CORS
```env
CORS_ALLOWED_ORIGINS=<origins>          # Orígenes permitidos para CORS
```

#### JWT
```env
ACCESS_TOKEN_LIFETIME_MINUTES=60        # Duración del access token
REFRESH_TOKEN_LIFETIME_DAYS=7           # Duración del refresh token
```

#### Celery & Redis
```env
CELERY_BROKER_URL=redis://redis:6379/0     # Broker de Celery
CELERY_RESULT_BACKEND=redis://redis:6379/0 # Backend de resultados
```

#### Google OAuth
```env
GOOGLE_CLIENT_ID=<client_id>            # Client ID de Google Cloud
GOOGLE_CLIENT_SECRET=<secret>           # Secret de Google Cloud
GOOGLE_REDIRECT_URI=<uri>               # URI de callback
FRONTEND_URL=<url>                      # URL del frontend
```

#### APIs Externas
```env
OPENAI_API_KEY=sk-proj-...              # API key de OpenAI (para validación)
VITE_MAPBOX_TOKEN=pk....                # Token de Mapbox (para mapas)
```

#### AWS S3 (Opcional)
```env
USE_S3=False                            # Habilitar almacenamiento en S3
AWS_ACCESS_KEY_ID=<key>                 # Access key de AWS
AWS_SECRET_ACCESS_KEY=<secret>          # Secret key de AWS
AWS_STORAGE_BUCKET_NAME=<bucket>        # Nombre del bucket
AWS_S3_REGION_NAME=<region>             # Región de AWS
```

### Frontend (Variables en docker-compose.yml)

```yaml
environment:
  - VITE_API_URL=https://badgeup.duckdns.org/api  # URL del backend
  - VITE_WS_URL=wss://badgeup.duckdns.org         # URL WebSocket
  - VITE_HOST=0.0.0.0                             # Host del dev server
```

---

## Problemas Conocidos y Limitaciones

### Limitaciones Actuales

#### 1. Solo Automóviles
- **Problema**: El sistema solo soporta álbumes de automóviles actualmente
- **Impacto**: No se pueden crear álbumes de flores, animales, lugares, etc.
- **Solución Futura**: Hacer el sistema dinámico por álbum (estimado: 1 tarde de desarrollo)

#### 2. Validación de Fotos No Restrictiva
- **Problema**: Los usuarios pueden subir cualquier foto, incluso de Google
- **Impacto**: No garantiza que la foto sea original o tomada en ese momento
- **Solución Futura**:
  - Validar que la foto sea tomada al momento (metadata EXIF)
  - Validar que la ubicación de la foto coincida con la ubicación del GPS

#### 3. Diseño No Responsivo
- **Problema**: La interfaz no está optimizada para móviles
- **Impacto**: Experiencia inconsistente en diferentes tamaños de pantalla
- **Solución Futura**: Rediseño responsive con TailwindCSS mobile-first

### Bugs Conocidos

#### 1. Persistencia de Datos
- **Problema**: No hay backups automáticos de PostgreSQL
- **Riesgo**: Pérdida de datos en caso de fallo
- **Workaround**: Backups manuales periódicos

#### 2. SSL/TLS
- **Problema**: Método de configuración de SSL no documentado
- **Riesgo**: Dificultad para renovar certificados
- **Solución**: Documentar proceso con Certbot

### Consideraciones de Seguridad

#### Claves en .env
QUETIIIIII

#### CORS y CSRF
- Actualizar `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` según dominios reales
- No usar `CORS_ALLOW_ALL_ORIGINS=True` en producción

---

## Roadmap

### Fase 1: Expansión de Contenido (Corto Plazo)
- [ ] Sistema dinámico de álbumes (flores, animales, lugares)
- [ ] Más álbumes de automóviles (clásicos, camionetas, SUVs)
- [ ] Validación de metadata EXIF para fotos originales
- [ ] Validación de ubicación GPS en tiempo real

### Fase 2: Mejoras de UX (Mediano Plazo)
- [ ] Rediseño responsive mobile-first
- [ ] PWA (Progressive Web App)
- [ ] Modo offline con sincronización
- [ ] Onboarding interactivo
- [ ] Tutorial integrado

### Fase 3: Gamificación Avanzada (Mediano Plazo)
- [ ] Logros y badges especiales
- [ ] Racha diaria (daily streaks)
- [ ] Desafíos semanales
- [ ] Sistema de amigos
- [ ] Intercambio de stickers

### Fase 4: Comercialización (Largo Plazo)
- [ ] Campañas publicitarias personalizadas
  - Ejemplo: "Colecciona las 10 latas especiales de Coca-Cola"
- [ ] Alianzas con marcas
- [ ] Sistema de recompensas físicas
- [ ] Geofencing para eventos
- [ ] Analytics para empresas

### Fase 5: Infraestructura (Continuo)
- [ ] CI/CD con GitHub Actions
- [ ] Backups automáticos de PostgreSQL
- [ ] Monitoreo con Prometheus + Grafana
- [ ] Logs centralizados (ELK Stack)
- [ ] Auto-scaling en AWS
- [ ] CDN para assets (CloudFront)
- [ ] Rate limiting y anti-abuse

---

## Contribuir
no ocupo ayuda el repo se cerrara cuando el profe califique
---

## Licencia
no se wey apenas y pago el sat
---

## Contacto

**Proyecto BadgeUp** - Proyecto Universitario ITESO

- Repositorio: [GitHub](https://github.com/tu-usuario/badgeup)
- Producción: [https://badgeup.duckdns.org](https://badgeup.duckdns.org)

---

## Agradecimientos

- **OpenAI**: Por la API de Vision que hace posible la validación inteligente
- **Mapbox**: Por los mapas interactivos
- **Google**: Por OAuth y servicios de autenticación
- **DuckDNS**: Por DNS dinámico gratuito
- **Comunidad Open Source**: Por todas las librerías increíbles

---

**Construido con ❤️ por el equipo BadgeUp**

*Colecciona el mundo, un sticker a la vez*