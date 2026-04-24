# Запуск Kittygram с помощью Docker

## Требования
- Установленные Docker и Docker Compose
- Git (для клонирования репозитория)

## Быстрый старт

1. Клонировать репозиторий и перейти в папку проекта:
   ```bash
   git clone <url-репозитория>
   cd kittygram_my
   ```

2. Создать файл `.env` на основе примера:
   ```bash
   cp .env.example .env
   ```
   Отредактировать `.env`, указав свои значения (пароль базы данных, секретный ключ Django и т.д.).  
   Поле `ALLOWED_HOSTS` должно содержать `localhost` и `127.0.0.1`.

3. Запустить сборку и запуск контейнеров:
   ```bash
   docker-compose -f docker-compose.production.yml up -d --build
   ```

4. Применить миграции базы данных:
   ```bash
   docker-compose -f docker-compose.production.yml exec backend python manage.py migrate
   ```

5. Собрать статические файлы:
   ```bash
   docker-compose -f docker-compose.production.yml exec backend python manage.py collectstatic --noinput
   ```

6. (Опционально) Создать суперпользователя для входа в админку:
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

## Возможные проблемы и решения

- **Порт 80 уже занят** – измените порт в файле `docker-compose.production.yml` для сервиса `nginx`:
  ```yaml
  ports:
    - "8080:80"
  ```
  Тогда приложение будет доступно по адресу `http://localhost:8080`.

- **Ошибка `Permission denied` при запуске** – убедитесь, что Docker Desktop запущен (Windows/macOS) или добавьте пользователя в группу `docker` (Linux).

- **Статика не подгружается** – после обновления кода перезапустите контейнеры с флагом `--build` и заново выполните `collectstatic`.

Все команды выполняются из корневой директории проекта (там, где лежит `docker-compose.production.yml`).