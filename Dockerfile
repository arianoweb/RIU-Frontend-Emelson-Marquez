# Dockerfile simplificado para desarrollo
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto para Angular
EXPOSE 4200

# Comando para iniciar la aplicación
CMD ["npm", "start"]