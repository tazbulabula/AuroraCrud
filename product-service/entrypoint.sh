#!/bin/bash
set -e

echo "🚀 Iniciando deploy do Product Service..."

# 🔧 Mostrar variáveis
echo "🔍 Variáveis de ambiente:"
echo "  DB_HOST: ${DB_HOST:-NÃO DEFINIDO}"
echo "  DB_DATABASE: ${DB_DATABASE:-NÃO DEFINIDO}"
echo "  DB_USERNAME: ${DB_USERNAME:-NÃO DEFINIDO}"

# Verificar se DB_HOST está configurado
if [ -z "$DB_HOST" ] || [ "$DB_HOST" = "postgres" ]; then
    echo "❌ DB_HOST não está configurado corretamente!"
    echo "Configure no Render:"
    echo "  DB_HOST=dpg-daelrhmq1p3s739t5lag-a"
    exit 1
fi

echo "🧹 Limpando cache de configuração..."
php artisan config:clear

echo "📦 Verificando conexão com o banco..."
if php artisan db:show > /dev/null 2>&1; then
    echo "✅ Conexão com o banco OK!"
else
    echo "⚠️ Falha ao conectar ao banco"
    php artisan db:show || true
    echo "Verifique as credenciais no Render"
    exit 1
fi

echo "📦 Executando migrations..."
php artisan migrate --force --path=database/migrations/products

echo "🧹 Otimizando cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Setup concluído!"

echo "🚀 Iniciando servidor..."
exec php artisan serve --host=0.0.0.0 --port=8000