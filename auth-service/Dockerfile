FROM composer:2 AS build
WORKDIR /app
COPY composer.json ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

FROM php:8.4-fpm

# ✅ Adicionar libicu-dev para a extensão intl
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    zip \
    libicu-dev \
    && docker-php-ext-install pdo_pgsql zip intl

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copiar arquivos
COPY . .

# Copiar vendor
COPY --from=build /app/vendor ./vendor

# ✅ Executar scripts
RUN composer run-script post-autoload-dump || true

# Criar diretórios
RUN mkdir -p /var/www/resources/views
RUN mkdir -p /var/www/storage/framework/views

# Permissões
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/resources/views

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]