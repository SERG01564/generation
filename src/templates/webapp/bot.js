import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Используем сессии для хранения состояния
bot.use(session());

// Обработка команды /start
bot.command('start', async (ctx) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Открыть форму', web_app: { url: process.env.WEBAPP_URL } }]
    ]
  };
  
  await ctx.reply(
    'Добро пожаловать! 👋\n\n' +
    'Нажмите кнопку ниже, чтобы открыть форму:',
    { reply_markup: keyboard }
  );
});

// Обработка данных из Web App
bot.on(message('web_app_data'), async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    
    // Здесь можно добавить сохранение данных в базу данных
    console.log('Получены данные:', data);
    
    await ctx.reply(
      '✅ Спасибо за ваше сообщение!\n\n' +
      `Имя: ${data.name}\n` +
      `Email: ${data.email}\n` +
      `Сообщение: ${data.message}`
    );
  } catch (error) {
    console.error('Ошибка обработки данных:', error);
    await ctx.reply('❌ Произошла ошибка при обработке данных');
  }
});

// Запуск Express сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

// Запуск бота
bot.launch().then(() => {
  console.log('Бот запущен!');
}).catch((err) => {
  console.error('Ошибка запуска бота:', err);
});

// Корректное завершение работы
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  process.exit(0);
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  process.exit(0);
}); 