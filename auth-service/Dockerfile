FROM composer:2 AS build
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

FROM php:8.4-fpm

# Instalar dependências do sistema e extensões PHP necessárias
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    zip \
    && docker-php-ext-install pdo_mysql zip

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Definir diretório de trabalho
WORKDIR /var/www

# Copiar arquivos do projeto Laravel
COPY . .


# Permissões para storage e bootstrap
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Expor porta padrão do Laravel
EXPOSE 8000

# Comando para iniciar o servidor Laravel
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
