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

# Criar diretórios necessários
RUN mkdir -p /var/www/resources/views
RUN mkdir -p /var/www/storage/framework/views
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/resources/views

# Copiar entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]