import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Используем сессии для хранения состояния
bot.use(session());

// Обработка команды /start
bot.command('start', async (ctx) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Задать вопрос', callback_data: 'ask_question' }],
      [{ text: 'Помощь', callback_data: 'help' }]
    ]
  };
  
  await ctx.reply(
    '👋 Привет! Я ИИ-ассистент.\n\n' +
    'Я могу помочь вам с различными вопросами. ' +
    'Просто нажмите кнопку "Задать вопрос" или напишите свой вопрос.',
    { reply_markup: keyboard }
  );
});

// Обработка нажатий на inline кнопки
bot.action('ask_question', async (ctx) => {
  await ctx.reply('Напишите ваш вопрос, и я постараюсь на него ответить.');
});

bot.action('help', async (ctx) => {
  await ctx.reply(
    '📋 Как пользоваться ботом:\n\n' +
    '1. Нажмите "Задать вопрос" или просто напишите свой вопрос\n' +
    '2. Дождитесь ответа от ИИ\n' +
    '3. Задавайте уточняющие вопросы\n\n' +
    '❗️ Ограничения:\n' +
    '- Максимальная длина вопроса: 1000 символов\n' +
    '- Ответ может занять некоторое время\n' +
    '- Бот не хранит историю разговора'
  );
});

// Обработка текстовых сообщений
bot.on(message('text'), async (ctx) => {
  try {
    // Проверяем длину сообщения
    if (ctx.message.text.length > 1000) {
      await ctx.reply('❌ Сообщение слишком длинное. Максимальная длина - 1000 символов.');
      return;
    }

    // Отправляем "печатает..."
    await ctx.replyWithChatAction('typing');

    // Получаем ответ от OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Вы - полезный ассистент, который отвечает на вопросы пользователя. " +
                  "Отвечайте кратко и по существу. Используйте эмодзи для более дружелюбного общения."
        },
        {
          role: "user",
          content: ctx.message.text
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const answer = completion.choices[0].message.content;

    // Отправляем ответ
    await ctx.reply(answer);

  } catch (error) {
    console.error('Ошибка при обработке сообщения:', error);
    await ctx.reply(
      '❌ Произошла ошибка при обработке вашего запроса.\n' +
      'Пожалуйста, попробуйте еще раз позже.'
    );
  }
});

// Запуск бота
bot.launch().then(() => {
  console.log('ИИ-бот запущен!');
}).catch((err) => {
  console.error('Ошибка запуска бота:', err);
});

// Корректное завершение работы
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 