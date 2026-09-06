FROM composer:2 AS build
WORKDIR /app
COPY composer.json ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

FROM php:8.4-fpm

# Instalar dependências do sistema e extensões PHP necessárias
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    zip \
    && docker-php-ext-install pdo_mysql zip

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copiar arquivos do projeto Laravel
COPY . .

# Copiar vendor do estágio de build
COPY --from=build /app/vendor ./vendor

# Executar scripts
RUN composer run-script post-autoload-dump || true

# Permissões para storage e bootstrap
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]