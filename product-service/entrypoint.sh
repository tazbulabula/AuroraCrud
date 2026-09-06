#!/bin/bash
set -e

echo "🚀 Iniciando deploy do Product Service..."

echo "🔍 Variáveis de ambiente:"
echo "  DB_HOST: ${DB_HOST}"
echo "  DB_DATABASE: ${DB_DATABASE}"
echo "  DB_USERNAME: ${DB_USERNAME}"

echo "🧹 Limpando cache de configuração..."
php artisan config:clear

echo "📦 Verificando conexão com o banco..."
if php artisan db:show > /dev/null 2>&1; then
    echo "✅ Conexão com o banco OK!"
else
    echo "⚠️ Falha ao conectar ao banco"
    php artisan db:show || true
    exit 1
fi

echo "📦 Executando migrations..."
php artisan migrate --force

# ✅ Criar diretório de views se não existir
if [ ! -d "/var/www/resources/views" ]; then
    echo "📁 Criando diretório de views..."
    mkdir -p /var/www/resources/views
fi

echo "🧹 Otimizando cache..."
php artisan config:cache
php artisan route:cache
# ✅ Ignorar erro se não houver views
php artisan view:cache || true

echo "✅ Setup concluído!"
exec php artisan serve --host=0.0.0.0 --port=8000