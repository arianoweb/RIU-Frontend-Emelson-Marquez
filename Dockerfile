# Dockerfile para desarrollo Angular
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache git curl

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production=false

# Copiar código fuente
COPY . .

# Exponer puerto para Angular
EXPOSE 4200

# Comando para iniciar la aplicación en modo desarrollo
CMD ["npm", "run", "start"]