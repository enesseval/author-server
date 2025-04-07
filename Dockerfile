# Node.js ve TypeScript için temel image
FROM node:18-alpine

# Çalışma dizini oluşturuluyor
WORKDIR /server

# package.json ve package-lock.json'ı kopyalayın
COPY package.json package-lock.json ./

# Gerekli bağımlılıkları yükleyin
RUN npm install

# TypeScript dosyalarını kopyalayın
COPY . .

# Sunucuyu derleyip çalıştırmak için komut
RUN npm run build

# Sunucuyu çalıştırmak için portu açın
EXPOSE 3001

# Sunucu başlatma komutu
CMD ["npm", "run", "dev"]
