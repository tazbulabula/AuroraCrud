#!/bin/bash
set -e

echo "🚀 Iniciando deploy..."

# 🔧 Mostrar variáveis
echo "🔍 Variáveis de ambiente:"
echo "  DB_HOST: ${DB_HOST}"
echo "  DB_DATABASE: ${DB_DATABASE}"
echo "  DB_USERNAME: ${DB_USERNAME}"

echo "🧹 Limpando cache de configuração..."
php artisan config:clear

echo "📦 Executando migrations..."
php artisan migrate --force
php artisan db:seed --force

echo "🧹 Otimizando cache..."
php artisan config:cache
php artisan route:cache

echo "✅ Setup concluído!"

echo "🚀 Iniciando servidor..."
exec php artisan serve --host=0.0.0.0 --port=8000