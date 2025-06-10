import { Telegraf, session } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Используем сессии для хранения состояния
bot.use(session());

// Команда /start
bot.start((ctx) => {
    ctx.session = {
        step: 'start',
        requestData: {}
    };
    
    ctx.reply(
        'Добро пожаловать в бот заявок! 📝\n\n' +
        'Доступные команды:\n' +
        '/new - Создать новую заявку\n' +
        '/help - Показать это сообщение\n\n' +
        'Нажмите /new чтобы создать заявку!'
    );
});

// Команда /help
bot.help((ctx) => {
    ctx.reply(
        'Как пользоваться ботом:\n\n' +
        '1. Нажмите /new чтобы создать новую заявку\n' +
        '2. Следуйте инструкциям бота\n' +
        '3. Заполните все необходимые данные\n' +
        '4. Отправьте заявку на рассмотрение\n\n' +
        'Удачи! 📋'
    );
});

// Команда /new
bot.command('new', (ctx) => {
    ctx.session = {
        step: 'name',
        requestData: {}
    };
    
    ctx.reply('Пожалуйста, введите ваше имя:');
});

// Обработка текстовых сообщений
bot.on('text', (ctx) => {
    if (!ctx.session || !ctx.session.step) {
        return ctx.reply('Пожалуйста, начните с команды /new');
    }

    const text = ctx.message.text;

    switch (ctx.session.step) {
        case 'name':
            ctx.session.requestData.name = text;
            ctx.session.step = 'phone';
            ctx.reply('Введите ваш номер телефона:');
            break;

        case 'phone':
            if (!/^\+?[\d\s-]{10,}$/.test(text)) {
                return ctx.reply('Пожалуйста, введите корректный номер телефона');
            }
            ctx.session.requestData.phone = text;
            ctx.session.step = 'email';
            ctx.reply('Введите ваш email:');
            break;

        case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
                return ctx.reply('Пожалуйста, введите корректный email');
            }
            ctx.session.requestData.email = text;
            ctx.session.step = 'description';
            ctx.reply('Опишите вашу заявку:');
            break;

        case 'description':
            ctx.session.requestData.description = text;
            ctx.session.step = 'confirm';
            
            const requestText = 
                '📋 Проверьте данные заявки:\n\n' +
                `👤 Имя: ${ctx.session.requestData.name}\n` +
                `📱 Телефон: ${ctx.session.requestData.phone}\n` +
                `📧 Email: ${ctx.session.requestData.email}\n` +
                `📝 Описание: ${ctx.session.requestData.description}\n\n` +
                'Всё верно?';

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '✅ Подтвердить', callback_data: 'confirm_request' },
                        { text: '❌ Отменить', callback_data: 'cancel_request' }
                    ]
                ]
            };

            ctx.reply(requestText, { reply_markup: keyboard });
            break;
    }
});

// Обработка подтверждения заявки
bot.action('confirm_request', (ctx) => {
    const requestData = ctx.session.requestData;
    
    // Отправляем заявку администратору
    const adminId = process.env.ADMIN_ID;
    if (adminId) {
        bot.telegram.sendMessage(
            adminId,
            '📨 Новая заявка!\n\n' +
            `👤 Имя: ${requestData.name}\n` +
            `📱 Телефон: ${requestData.phone}\n` +
            `📧 Email: ${requestData.email}\n` +
            `📝 Описание: ${requestData.description}\n\n` +
            `🆔 ID пользователя: ${ctx.from.id}`
        );
    }

    ctx.reply(
        '✅ Заявка успешно отправлена!\n\n' +
        'Мы свяжемся с вами в ближайшее время.'
    );

    // Сбрасываем сессию
    ctx.session = {
        step: 'start',
        requestData: {}
    };
});

// Обработка отмены заявки
bot.action('cancel_request', (ctx) => {
    ctx.reply('❌ Заявка отменена');
    
    // Сбрасываем сессию
    ctx.session = {
        step: 'start',
        requestData: {}
    };
});

// Обработка ошибок
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
});

// Запуск бота
bot.launch().then(() => {
    console.log('Request Bot started successfully');
}).catch((err) => {
    console.error('Failed to start bot:', err);
});

// Включаем graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 