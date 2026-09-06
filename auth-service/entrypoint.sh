#!/bin/bash

echo "🚀 Iniciando deploy..."

# 🔧 Garantir que as variáveis do Render sejam usadas
if [ ! -z "$DATABASE_URL" ]; then
    echo "✅ Usando DATABASE_URL do ambiente"
    export DB_CONNECTION=pgsql
elif [ ! -z "$DB_HOST" ]; then
    echo "✅ Usando DB_HOST do ambiente: $DB_HOST"
else
    echo "⚠️ Nenhuma variável de banco encontrada!"
    echo "DB_HOST: $DB_HOST"
    echo "DATABASE_URL: $DATABASE_URL"
fi

# Verificar conexão com o banco
echo "📦 Verificando conexão com o banco..."
php artisan db:show || echo "⚠️ Falha ao conectar ao banco"
php artisan db:seed --force || echo "⚠️ Falha ao popular o banco"

# Executar migrations
echo "📦 Executando migrations..."
if php artisan migrate --force; then
    echo "✅ Migrations executadas com sucesso!"
else
    echo "❌ Falha ao executar migrations"
    exit 1
fi

# Limpar cache
echo "🧹 Otimizando cache..."
php artisan config:cache
php artisan route:cache

# Verificar se a view path existe
if [ ! -d "/var/www/resources/views" ]; then
    echo "📁 Criando diretório de views..."
    mkdir -p /var/www/resources/views
fi

# Iniciar servidor
echo "🚀 Iniciando servidor..."
php artisan serve --host=0.0.0.0 --port=8000