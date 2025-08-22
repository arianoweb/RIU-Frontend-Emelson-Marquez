# 🦸‍♂️ Heroes App

Aplicación Angular para gestión de superhéroes.

## 🔧 Tecnologías

- **Angular 18**
- **Angular Material**
- **TypeScript**

## 🚀 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar aplicación
npm start
```

Abrir `http://localhost:4200`

## 🐳 Docker (Alternativa)

```bash
# Verificar Docker
docker --version

# Ejecutar
npm run docker:up

# Detener
npm run docker:down

# Ver logs en tiempo real
docker-compose logs -f

# Reconstruir imagen (si hay cambios)
docker-compose up --build
```

**Requisito**: Docker Desktop ejecutándose.

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Coverage
npm run coverage
```