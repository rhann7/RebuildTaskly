FROM php:8.2-fpm

RUN apt-get update && apt-get upgrade -y \
    git curl zip unzip libognig-dev libxml12-dev libzip-dev libicu-dev \
    libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure intl \
    && docker-php-ext-install pdo pdo_mysql mbstring xml intl zip opcache
    
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

EXPOSE 9000

CMD [ "php-fpm" ]