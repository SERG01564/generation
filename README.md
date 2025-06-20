# Telegram Bot Generator

Генератор Telegram ботов с различными функциональностями.

## Возможности

- Создание ботов разных типов:
  - Quiz Bot (Бот-викторина)
  - Request Bot (Бот для заявок)
  - Catalog Bot (Бот-каталог)
  - AI Bot (Бот с OpenAI)
  - Web App Bot (Бот с веб-интерфейсом)

## Установка

```bash
# Клонируем репозиторий
git clone https://github.com/your-username/telegram-bot-generator.git

# Переходим в директорию проекта
cd telegram-bot-generator

# Устанавливаем зависимости
npm install
```

## Использование

1. Запустите генератор:
```bash
npm start
```

2. Следуйте инструкциям в консоли:
   - Выберите тип бота
   - Введите имя бота
   - Введите токен бота (получите у @BotFather)
   - Для AI бота введите OpenAI API ключ

3. После создания бота:
```bash
cd имя_бота
npm install
npm start
```

## Типы ботов

### Quiz Bot
- Создание викторин с вопросами и ответами
- Подсчет результатов
- Возможность добавления своих вопросов

### Request Bot
- Создание заявок
- Валидация данных
- Отправка заявок администратору

### Catalog Bot
- Каталог товаров
- Корзина покупок
- Оформление заказов

### AI Bot
- Интеграция с OpenAI
- Умные ответы на вопросы
- Настраиваемые параметры

### Web App Bot
- Веб-интерфейс
- Управление через браузер
- Адаптивный дизайн

## Разработка

```bash
# Запуск в режиме разработки
npm run dev
```

## Лицензия

MIT 