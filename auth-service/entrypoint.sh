#!/bin/bash
set -e  # Para o script se algum comando falhar

echo "🚀 Iniciando deploy..."

# 🔧 Mostrar variáveis de ambiente para debug
echo "🔍 Variáveis de ambiente:"
echo "  DATABASE_URL: ${DATABASE_URL:-NÃO DEFINIDA}"
echo "  DB_HOST: ${DB_HOST:-NÃO DEFINIDO}"
echo "  DB_DATABASE: ${DB_DATABASE:-NÃO DEFINIDO}"
echo "  DB_USERNAME: ${DB_USERNAME:-NÃO DEFINIDO}"
echo "  APP_ENV: ${APP_ENV:-NÃO DEFINIDO}"

# 🔧 Configurar conexão com o banco
if [ ! -z "$DATABASE_URL" ]; then
    echo "✅ Usando DATABASE_URL do ambiente"
    # Extrair host para debug
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')
    echo "  Host extraído: $DB_HOST"
elif [ ! -z "$DB_HOST" ]; then
    echo "✅ Usando DB_HOST do ambiente: $DB_HOST"
else
    echo "❌ Nenhuma variável de banco encontrada!"
    echo "Configure no Render:"
    echo "  DATABASE_URL=postgresql://usuario:senha@host:5432/database"
    echo "  OU"
    echo "  DB_HOST=seu-host.render.com"
    echo "  DB_DATABASE=seu-banco"
    echo "  DB_USERNAME=seu-usuario"
    echo "  DB_PASSWORD=sua-senha"
    exit 1
fi

# Limpar cache de configuração para usar novas variáveis
echo "🧹 Limpando cache de configuração..."
php artisan config:clear

# Verificar conexão com o banco
echo "📦 Verificando conexão com o banco..."
if php artisan db:show > /dev/null 2>&1; then
    echo "✅ Conexão com o banco OK!"
else
    echo "⚠️ Falha ao conectar ao banco"
    echo "Verifique as credenciais e o host"
    php artisan db:show  # Mostrar erro detalhado
    exit 1
fi

# Executar migrations
echo "📦 Executando migrations..."
if php artisan migrate --force; then
    echo "✅ Migrations executadas com sucesso!"
    php artisan db:seed --force || echo "⚠️ Falha ao popular o banco"
else
    echo "❌ Falha ao executar migrations"
    exit 1
fi

# Limpar cache
echo "🧹 Otimizando cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache  # Adicionar view cache

# Verificar se a view path existe
if [ ! -d "/var/www/resources/views" ]; then
    echo "📁 Criando diretório de views..."
    mkdir -p /var/www/resources/views
fi

echo "✅ Setup concluído!"
echo "🚀 Iniciando servidor..."

# ✅ Usar exec para substituir o processo atual
exec php artisan serve --host=0.0.0.0 --port=8000