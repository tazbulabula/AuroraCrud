FROM composer:2 AS build
WORKDIR /app
COPY composer.json ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

FROM php:8.4-fpm

# Instalar dependências
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    zip \
    && docker-php-ext-install pdo_pgsql zip

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copiar arquivos
COPY . .

# Copiar vendor
COPY --from=build /app/vendor ./vendor

# ✅ Executar migrations durante o build
RUN php artisan migrate --force || true

# Permissões
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000

# ✅ Iniciar servidor
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]