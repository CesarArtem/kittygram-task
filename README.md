# Запуск Kittygram с помощью Docker

## Требования
- Установленные Docker и Docker Compose
- Git (для клонирования репозитория)

## Быстрый старт

1. Клонировать репозиторий и перейти в папку проекта:
   ```bash
   git clone https://github.com/CesarArtem/kittygram-task/tree/release
   cd kittygram_my
   ```

2. Запустить сборку и запуск контейнеров:
   ```bash
   docker-compose -f docker-compose.production.yml up -d --build
   ```

3. Применить миграции базы данных:
   ```bash
   docker-compose -f docker-compose.production.yml exec backend python manage.py makemigrations
   docker-compose -f docker-compose.production.yml exec backend python manage.py migrate
   ```

4. Собрать статические файлы:
   ```bash
   docker-compose -f docker-compose.production.yml exec backend python manage.py collectstatic --noinput
   ```

5. (Опционально) Создать суперпользователя для входа в админку:
   ```bash
   docker-compose -f docker-compose.production.yml exec backend python manage.py createsuperuser
   ```

## Проверка работы

- Открыть в браузере: `http://localhost` – главная страница Kittygram
- Админка: `http://localhost/admin`
- Документация API: `http://localhost/swagger/` или `http://localhost/redoc/`
- Пример запроса к API: `curl http://localhost/api/duels/`

## Остановка и удаление контейнеров

```bash
docker-compose -f docker-compose.production.yml down
```

Чтобы удалить также тома с данными (база, статика):
```bash
docker-compose -f docker-compose.production.yml down -v
```

Все команды выполняются из корневой директории проекта (там, где лежит `docker-compose.production.yml`).
