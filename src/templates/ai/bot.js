import { Telegraf } from 'telegraf';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Обработка команды /start
bot.start((ctx) => {
    ctx.reply('Привет! Я AI бот. Задайте мне любой вопрос, и я постараюсь на него ответить.');
});

// Обработка команды /help
bot.help((ctx) => {
    ctx.reply(
        'Доступные команды:\n' +
        '/start - Начать общение\n' +
        '/help - Показать это сообщение\n' +
        '/clear - Очистить историю диалога\n\n' +
        'Просто напишите ваш вопрос, и я отвечу на него.'
    );
});

// Обработка команды /clear
bot.command('clear', (ctx) => {
    ctx.session = { messages: [] };
    ctx.reply('История диалога очищена.');
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
    try {
        const userMessage = ctx.message.text;
        
        // Отправляем "печатает..." статус
        await ctx.replyWithChatAction('typing');

        // Получаем ответ от OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Вы - полезный ассистент, который отвечает на вопросы пользователя. Отвечайте кратко и по существу."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });

        const response = completion.choices[0].message.content;
        await ctx.reply(response);
    } catch (error) {
        console.error('Error:', error);
        await ctx.reply('Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.');
    }
});

// Обработка ошибок
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
});

// Запуск бота
bot.launch().then(() => {
    console.log('AI Bot started successfully');
}).catch((err) => {
    console.error('Failed to start bot:', err);
});

// Включаем graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 