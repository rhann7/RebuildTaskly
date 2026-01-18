# 1. Gunakan image PHP resmi dengan varian FPM (FastCGI Process Manager)
FROM php:8.2-fpm

# 2. Set working directory di dalam container
WORKDIR /var/www

# 3. Install dependencies sistem yang diperlukan
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    libzip-dev \
    libpq-dev # Diperlukan agar PHP bisa berkomunikasi dengan PostgreSQL

# 4. Bersihkan cache apt untuk mengurangi ukuran image
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 5. Install ekstensi PHP yang dibutuhkan Laravel dan PostgreSQL
RUN docker-php-ext-install pdo_pgsql pgsql zip exif pcntl
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install gd

# 6. Install Composer (Copy dari image resmi Composer)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 7. Copy file proyek Anda ke dalam container
COPY . /var/www

# 8. Set hak akses folder storage dan cache (Penting untuk Laravel)
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# 9. Expose port 9000 untuk PHP-FPM
EXPOSE 9000

CMD ["php-fpm"]