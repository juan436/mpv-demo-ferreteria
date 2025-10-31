# Ferretería - Gestión de Pedidos

![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)

Aplicación web progresiva (PWA) para la gestión de pedidos en ferretería, con soporte offline y sincronización. Desarrollada con Next.js, TypeScript y TailwindCSS.

## 🚀 Características

- **Gestión de Pedidos**: Creación, edición y comparación de pedidos con validación
- **Offline-first**: Funciona sin conexión con IndexedDB
- **Responsive**: Diseño adaptado para móvil, tablet y escritorio
- **Exportación**: Generación de reportes en Excel con estilos
- **Notificaciones por correo**: Envío automático de reportes de pedidos
- **Autenticación**: Sistema de usuarios y roles

## 🛠️ Requisitos

- Node.js 18+
- npm, yarn o pnpm
- Docker (opcional, para desarrollo con contenedores)

## 📦 Instalación

1. Clonar el repositorio
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd frontend
   ```

2. Instalar dependencias
   ```bash
   pnpm install
   # o
   npm install
   # o
   yarn install
   ```

3. Configurar variables de entorno
   ```bash
   cp env.example .env.local
   # Editar .env.local según sea necesario
   ```

## 🚦 Iniciar en desarrollo

```bash
pnpm dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗️ Construir para producción

```bash
pnpm build
# y luego
pnpm start
```

## 🐳 Docker

Construir la imagen:
```bash
docker build -t ferreteria-frontend .
```

Ejecutar contenedor:
```bash
docker run -p 3000:3000 ferreteria-frontend
```

## 📄 URL REPOSITORIO BACKEND
```
https://github.com/juan436/api-demo-ferreteria 
```

## 📄 Licencia

Este proyecto está bajo la licencia Apache 2.0. Cualquier modificación o uso debe preservar el aviso de copyright original:

```
Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
```

## ✉️ Contacto

Juan Villegas - [juancvillefer@gmail.com](mailto:juancvillefer@gmail.com)

---

*Este proyecto fue desarrollado como solución de gestión para ferreterías con enfoque en usabilidad móvil y funcionalidad offline.*
