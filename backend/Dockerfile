# ============================================
# 🧱 Laravel Backend Dockerfile (Optimized)
# ============================================

# Base image with PHP 8.2 FPM
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer globally
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy only composer files first to leverage Docker cache
COPY composer.json composer.lock ./

# Install PHP dependencies early (cached layer)
RUN composer install --no-interaction --no-dev --prefer-dist --optimize-autoloader || true

# Copy the rest of the application code
COPY . .

# Make sure storage and bootstrap cache directories are writable
RUN mkdir -p storage bootstrap/cache && chmod -R 777 storage bootstrap/cache

# ✅ Do NOT auto-generate a new APP_KEY
# The key must remain consistent — it will be read from your mounted .env file

# Expose Laravel port
EXPOSE 8000

# Default command to serve the application
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
