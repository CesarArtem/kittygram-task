# Первый этап: сборка приложения
FROM node:18-alpine AS build

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Второй этап: финальный образ
FROM node:18-alpine

WORKDIR /app

# Копируем собранное приложение из первого этапа
COPY --from=build /app/build /app/build

# При запуске контейнера копируем статику в volume
CMD cp -r /app/build/. /frontend_static/
