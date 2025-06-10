import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Используем сессии для хранения состояния
bot.use(session());

// Пример вопросов для квиза
const questions = [
  {
    question: 'Какой язык программирования мы используем?',
    options: ['JavaScript', 'Python', 'Java', 'C++'],
    correct: 0
  },
  {
    question: 'Что такое Node.js?',
    options: ['Браузер', 'Среда выполнения JavaScript', 'База данных', 'Фреймворк'],
    correct: 1
  }
];

// Обработка команды /start
bot.command('start', async (ctx) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Начать квиз', callback_data: 'start_quiz' }],
      [{ text: 'Правила', callback_data: 'rules' }]
    ]
  };
  
  await ctx.reply(
    'Добро пожаловать в квиз-бот! 🎯\n\n' +
    'Здесь вы можете проверить свои знания в программировании.',
    { reply_markup: keyboard }
  );
});

// Обработка нажатий на inline кнопки
bot.action('start_quiz', async (ctx) => {
  ctx.session.currentQuestion = 0;
  ctx.session.score = 0;
  await sendQuestion(ctx);
});

bot.action('rules', async (ctx) => {
  await ctx.reply(
    '📋 Правила квиза:\n\n' +
    '1. Вам будет предложено несколько вопросов\n' +
    '2. На каждый вопрос есть 4 варианта ответа\n' +
    '3. Выберите правильный ответ\n' +
    '4. В конце вы узнаете свой результат\n\n' +
    'Удачи! 🍀'
  );
});

// Отправка вопроса
async function sendQuestion(ctx) {
  const question = questions[ctx.session.currentQuestion];
  const keyboard = {
    inline_keyboard: question.options.map((option, index) => [
      { text: option, callback_data: `answer_${index}` }
    ])
  };
  
  await ctx.reply(
    `Вопрос ${ctx.session.currentQuestion + 1} из ${questions.length}:\n\n` +
    question.question,
    { reply_markup: keyboard }
  );
}

// Обработка ответов
bot.action(/answer_(\d+)/, async (ctx) => {
  const answer = parseInt(ctx.match[1]);
  const question = questions[ctx.session.currentQuestion];
  
  if (answer === question.correct) {
    ctx.session.score++;
    await ctx.reply('✅ Правильно!');
  } else {
    await ctx.reply('❌ Неправильно!');
  }
  
  ctx.session.currentQuestion++;
  
  if (ctx.session.currentQuestion < questions.length) {
    await sendQuestion(ctx);
  } else {
    await ctx.reply(
      `🎉 Квиз завершен!\n\n` +
      `Ваш результат: ${ctx.session.score} из ${questions.length}\n\n` +
      `Спасибо за участие!`
    );
  }
});

// Запуск бота
bot.launch().then(() => {
  console.log('Бот запущен!');
}).catch((err) => {
  console.error('Ошибка запуска бота:', err);
});

// Корректное завершение работы
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 