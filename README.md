## Запуск проекта с помощью Docker

### 1. Установка Docker и Docker Compose (на Ubuntu)

```markdow
```bash
sudo apt update && sudo apt install -y docker.io
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker $USER
```

### 2. Клонирование репозитория и подготовка `.env`

```bash
git clone https://github.com/CesarArtem/kittygram-task.git
cd kittygram-task
cp .env.example .env
```

Отредактируйте файл `.env`, заполнив секретные ключи и параметры подключения к базе данных.

### 3. Запуск всех контейнеров

```bash
docker-compose -f docker-compose.production.yml up -d --build
```

### 4. Применение миграций и сбор статики

```bash
docker-compose -f docker-compose.production.yml exec backend python manage.py migrate
docker-compose -f docker-compose.production.yml exec backend python manage.py collectstatic --noinput
```

### 5. Проверка работоспособности

После успешного запуска проект будет доступен по следующим адресам:

| Адрес | Описание |
|-------|----------|
| `http://localhost/` | Главная страница Kittygram |
| `http://localhost/admin/` | Админ-панель Django |
| `http://localhost/swagger/` | Документация API (Swagger) |
