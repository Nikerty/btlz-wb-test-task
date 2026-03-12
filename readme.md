# Wildberries Tariffs Sync Service

Сервис для автоматического сбора данных о тарифах коробов Wildberries, сохранения их в базу данных PostgreSQL и последующей синхронизации с Google Таблицами.

## Функционал
* **Сбор данных:** Ежечасный опрос WB API (`/api/v1/tariffs/box`).
* **Хранение:** Сохранение актуальных срезов данных в PostgreSQL с использованием логики `Upsert` (обновление при совпадении склада и даты).
* **Синхронизация:** Экспорт актуальных тарифов (на текущий день) в одну или несколько Google Таблиц.
* **Надежность:** Валидация переменных окружения через Zod, обработка некорректных данных (NaN) от API, автоматические миграции БД.

## Стек технологий
* **Runtime:** Node.js (ESM)
* **Language:** TypeScript
* **Database:** PostgreSQL + Knex.js
* **Containerization:** Docker + Docker Compose
* **APIs:** Google Sheets API v4, Wildberries Common API

## Быстрый запуск

### 1. Подготовка окружения
Создайте файл `.env` в корне проекта (на основе `.env.example`):
```env
# Wildberries
WB_API_TOKEN=ваш_токен

# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

# Google Cloud Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Spreadsheet IDS для первого запуска (опционально)
INITIAL_SPREADSHEET_IDS=id_of_spreadsheet
```

### 2. Запуск при помощи Docker

Запустить приложение можно при помощи команды:

```bash
docker-compose up -d --build
```

При старте контейнер автоматически применит миграции к базе данных

### 3. Полученные данных

После запуска приложение сразу же произведёт необходимые запросы и сохранит в своей базе данных полученные данные. Если добавлены ID гугл таблиц, то она сразу попытается синхронизировать данные. Добавить ID гугл таблиц можно, перечислив их через запятую в env параметре INITIAL_SPREADSHEET_IDS, или вручную, зайдя внутрь DB контейнера и совершив SQL запрос.