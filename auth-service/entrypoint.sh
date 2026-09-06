#!/bin/bash

echo "🚀 Iniciando deploy..."

# Verificar se o .env existe
if [ ! -f .env ]; then
    echo "⚠️ .env não encontrado, usando .env.example"
    cp .env.example .env
fi

# Executar migrations
echo "📦 Executando migrations..."
php artisan migrate --force
php artisan db:seed --force

# Limpar cache
echo "🧹 Otimizando cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Iniciar servidor
echo "🚀 Iniciando servidor..."
php artisan serve --host=0.0.0.0 --port=8000