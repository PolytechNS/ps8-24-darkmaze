# Utiliser l'image officielle Node.js 18 Slim comme image de base
FROM node:18-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers 'package.json' et 'package-lock.json' (si disponible)
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier tous les fichiers du projet dans le répertoire de travail du conteneur
COPY . .

# Exposer le port sur lequel l'application va tourner
EXPOSE 8000

# Définir la commande pour démarrer l'application
CMD ["node", "back/index.js"]

