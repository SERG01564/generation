import { Telegraf, session } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Используем сессии для хранения состояния
bot.use(session());

// Пример вопросов для викторины
const questions = [
    {
        question: 'Столица России?',
        options: ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург'],
        correct: 0
    },
    {
        question: 'Самая длинная река в мире?',
        options: ['Нил', 'Амазонка', 'Янцзы', 'Миссисипи'],
        correct: 0
    },
    {
        question: 'Кто написал "Войну и мир"?',
        options: ['Пушкин', 'Толстой', 'Достоевский', 'Чехов'],
        correct: 1
    }
];

// Команда /start
bot.start((ctx) => {
    ctx.session = {
        currentQuestion: 0,
        score: 0,
        inQuiz: false
    };
    
    ctx.reply(
        'Добро пожаловать в бот-викторину! 🎯\n\n' +
        'Доступные команды:\n' +
        '/start - Начать новую викторину\n' +
        '/quiz - Начать викторину\n' +
        '/help - Показать это сообщение\n\n' +
        'Нажмите /quiz чтобы начать!'
    );
});

// Команда /help
bot.help((ctx) => {
    ctx.reply(
        'Как пользоваться ботом:\n\n' +
        '1. Нажмите /quiz чтобы начать викторину\n' +
        '2. Отвечайте на вопросы, выбирая правильный вариант\n' +
        '3. В конце вы узнаете свой результат\n\n' +
        'Удачи! 🍀'
    );
});

// Команда /quiz
bot.command('quiz', (ctx) => {
    ctx.session = {
        currentQuestion: 0,
        score: 0,
        inQuiz: true
    };
    sendQuestion(ctx);
});

// Функция отправки вопроса
function sendQuestion(ctx) {
    const question = questions[ctx.session.currentQuestion];
    const keyboard = {
        inline_keyboard: question.options.map((option, index) => [{
            text: option,
            callback_data: `answer_${index}`
        }])
    };

    ctx.reply(
        `Вопрос ${ctx.session.currentQuestion + 1} из ${questions.length}:\n\n` +
        question.question,
        { reply_markup: keyboard }
    );
}

// Обработка ответов
bot.action(/answer_(\d+)/, (ctx) => {
    if (!ctx.session.inQuiz) return;

    const answer = parseInt(ctx.match[1]);
    const question = questions[ctx.session.currentQuestion];

    if (answer === question.correct) {
        ctx.session.score++;
        ctx.reply('✅ Правильно!');
    } else {
        ctx.reply(`❌ Неправильно! Правильный ответ: ${question.options[question.correct]}`);
    }

    ctx.session.currentQuestion++;

    if (ctx.session.currentQuestion < questions.length) {
        setTimeout(() => sendQuestion(ctx), 1000);
    } else {
        const percentage = (ctx.session.score / questions.length) * 100;
        ctx.reply(
            `🎉 Викторина завершена!\n\n` +
            `Ваш результат: ${ctx.session.score} из ${questions.length}\n` +
            `Процент правильных ответов: ${percentage}%\n\n` +
            `Нажмите /quiz чтобы начать новую викторину!`
        );
        ctx.session.inQuiz = false;
    }
});

// Обработка ошибок
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
});

// Запуск бота
bot.launch().then(() => {
    console.log('Quiz Bot started successfully');
}).catch((err) => {
    console.error('Failed to start bot:', err);
});

// Включаем graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 