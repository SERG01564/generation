# Telegram Bot Generator

Генератор проектов для Telegram ботов и мини-приложений.

## Возможности

- Создание различных типов ботов:
  - Quiz бот (викторина)
  - Application бот (форма сбора данных)
  - Catalog бот (каталог товаров)
  - AI бот (с интеграцией OpenAI)
  - Mini App (веб-приложение)
- Генерация полной структуры проекта
- Поддержка шаблонов с переменными
- Автоматическая настройка webhook
- Готовые инструкции по развертыванию

## Установка

```bash
npm install -g telegram-bot-generator
```

## Использование

### Через CLI

```bash
# Создание нового проекта
telegram-bot-generator create my-bot

# Создание проекта с указанием типа
telegram-bot-generator create my-bot --type quiz

# Создание проекта с указанием шаблона
telegram-bot-generator create my-bot --template path/to/template
```

### Через веб-интерфейс

```bash
# Запуск веб-интерфейса
telegram-bot-generator web
```

## Развертывание

### Подготовка к развертыванию

1. Создайте аккаунт на [Render](https://render.com)
2. Создайте нового бота через [@BotFather](https://t.me/BotFather)
3. Получите токен бота и сохраните его
4. Создайте репозиторий на GitHub и загрузите в него ваш проект

### Развертывание на Render

1. Войдите в панель управления Render
2. Нажмите "New +" и выберите "Web Service"
3. Подключите ваш GitHub репозиторий
4. Настройте параметры развертывания:
   - **Name**: Укажите название вашего сервиса
   - **Environment**: Node
   - **Region**: Выберите ближайший к вам регион
   - **Branch**: main (или ваша основная ветка)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Настройте переменные окружения:
   - `BOT_TOKEN` - токен вашего бота
   - `PORT` - порт (по умолчанию 3000)
   - `NODE_ENV` - production
6. Нажмите "Create Web Service"

### Настройка Webhook

После успешного развертывания на Render, настройте webhook для вашего бота:

1. Откройте терминал и выполните команду:
```bash
curl -F "url=https://your-app-name.onrender.com/webhook" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```
Замените:
- `your-app-name` на имя вашего сервиса на Render
- `<YOUR_BOT_TOKEN>` на токен вашего бота

2. Проверьте настройку webhook:
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

### Настройка Web App

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newapp`
3. Выберите вашего бота
4. Укажите название и описание мини-приложения
5. Загрузите иконку (если есть)
6. В поле URL введите адрес вашего приложения на Render:
   ```
   https://your-app-name.onrender.com
   ```

### Мониторинг и обновление

1. В панели управления Render вы можете:
   - Отслеживать логи приложения
   - Настраивать автоматическое развертывание
   - Управлять переменными окружения
   - Масштабировать приложение при необходимости

2. Для обновления бота:
   - Внесите изменения в код
   - Загрузите изменения в GitHub
   - Render автоматически обновит приложение

## Структура проекта

```
my-bot/
├── src/
│   ├── bot.js          # Основной файл бота
│   ├── config.js       # Конфигурация
│   └── templates/      # Шаблоны сообщений
├── public/             # Статические файлы
├── package.json
└── README.md
```

## Шаблоны

Генератор поддерживает шаблоны с переменными в формате `{{variable}}`. 
Переменные заменяются при создании проекта.

Пример шаблона:
```javascript
const welcomeMessage = `Привет, {{name}}!
Добро пожаловать в {{botName}}!`;
```

## Лицензия

MIT 