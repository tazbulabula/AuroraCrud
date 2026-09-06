FROM php:8.4-fpm

# Instalar dependências do sistema e extensões PHP necessárias
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    zip \
    libicu-dev \
    && docker-php-ext-install pdo_pgsql zip intl

RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Definir diretório de trabalho
WORKDIR /var/www

# Copiar arquivos do projeto Laravel
COPY . .

# ✅ Instalar dependências dentro do container
RUN composer install --no-dev --optimize-autoloader

# Permissões para storage e bootstrap
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh



# Expor porta padrão do Laravel
EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
# Comando para iniciar o servidor Laravel
#CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]