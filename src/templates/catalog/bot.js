import { Telegraf, session } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Используем сессии для хранения состояния
bot.use(session());

// Пример товаров
const products = [
    {
        id: 1,
        name: 'Смартфон X',
        price: 29999,
        description: 'Мощный смартфон с отличной камерой',
        image: 'https://example.com/phone.jpg'
    },
    {
        id: 2,
        name: 'Ноутбук Y',
        price: 49999,
        description: 'Легкий и производительный ноутбук',
        image: 'https://example.com/laptop.jpg'
    },
    {
        id: 3,
        name: 'Наушники Z',
        price: 4999,
        description: 'Беспроводные наушники с шумоподавлением',
        image: 'https://example.com/headphones.jpg'
    }
];

// Команда /start
bot.start((ctx) => {
    ctx.session = {
        cart: [],
        viewingProduct: null
    };
    
    ctx.reply(
        'Добро пожаловать в наш магазин! 🛍\n\n' +
        'Доступные команды:\n' +
        '/catalog - Показать каталог товаров\n' +
        '/cart - Показать корзину\n' +
        '/help - Показать это сообщение\n\n' +
        'Нажмите /catalog чтобы начать покупки!'
    );
});

// Команда /help
bot.help((ctx) => {
    ctx.reply(
        'Как пользоваться магазином:\n\n' +
        '1. Нажмите /catalog чтобы просмотреть товары\n' +
        '2. Выберите товар для просмотра деталей\n' +
        '3. Добавьте товар в корзину\n' +
        '4. Используйте /cart для управления корзиной\n\n' +
        'Приятных покупок! 🛒'
    );
});

// Команда /catalog
bot.command('catalog', (ctx) => {
    const keyboard = {
        inline_keyboard: products.map(product => [{
            text: `${product.name} - ${product.price}₽`,
            callback_data: `product_${product.id}`
        }])
    };

    ctx.reply('Выберите товар:', { reply_markup: keyboard });
});

// Команда /cart
bot.command('cart', (ctx) => {
    if (!ctx.session.cart || ctx.session.cart.length === 0) {
        return ctx.reply('Ваша корзина пуста');
    }

    const total = ctx.session.cart.reduce((sum, item) => sum + item.price, 0);
    const cartText = ctx.session.cart.map(item => 
        `${item.name} - ${item.price}₽`
    ).join('\n');

    const keyboard = {
        inline_keyboard: [
            [{ text: '🛒 Оформить заказ', callback_data: 'checkout' }],
            [{ text: '🗑 Очистить корзину', callback_data: 'clear_cart' }]
        ]
    };

    ctx.reply(
        `🛒 Ваша корзина:\n\n${cartText}\n\n` +
        `Итого: ${total}₽`,
        { reply_markup: keyboard }
    );
});

// Обработка выбора товара
bot.action(/product_(\d+)/, (ctx) => {
    const productId = parseInt(ctx.match[1]);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        return ctx.reply('Товар не найден');
    }

    ctx.session.viewingProduct = product;

    const keyboard = {
        inline_keyboard: [
            [{ text: '🛒 Добавить в корзину', callback_data: `add_${product.id}` }],
            [{ text: '🔙 Назад в каталог', callback_data: 'back_to_catalog' }]
        ]
    };

    ctx.reply(
        `📱 ${product.name}\n\n` +
        `${product.description}\n\n` +
        `Цена: ${product.price}₽`,
        { reply_markup: keyboard }
    );
});

// Обработка добавления в корзину
bot.action(/add_(\d+)/, (ctx) => {
    const productId = parseInt(ctx.match[1]);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        return ctx.reply('Товар не найден');
    }

    if (!ctx.session.cart) {
        ctx.session.cart = [];
    }

    ctx.session.cart.push(product);
    ctx.reply('✅ Товар добавлен в корзину!');
});

// Обработка очистки корзины
bot.action('clear_cart', (ctx) => {
    ctx.session.cart = [];
    ctx.reply('🗑 Корзина очищена');
});

// Обработка оформления заказа
bot.action('checkout', (ctx) => {
    if (!ctx.session.cart || ctx.session.cart.length === 0) {
        return ctx.reply('Ваша корзина пуста');
    }

    const total = ctx.session.cart.reduce((sum, item) => sum + item.price, 0);
    const orderText = ctx.session.cart.map(item => 
        `${item.name} - ${item.price}₽`
    ).join('\n');

    ctx.reply(
        `🎉 Заказ оформлен!\n\n` +
        `Ваш заказ:\n${orderText}\n\n` +
        `Итого: ${total}₽\n\n` +
        `Спасибо за покупку! 🛍`
    );

    ctx.session.cart = [];
});

// Обработка возврата в каталог
bot.action('back_to_catalog', (ctx) => {
    ctx.session.viewingProduct = null;
    const keyboard = {
        inline_keyboard: products.map(product => [{
            text: `${product.name} - ${product.price}₽`,
            callback_data: `product_${product.id}`
        }])
    };

    ctx.reply('Выберите товар:', { reply_markup: keyboard });
});

// Обработка ошибок
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
});

// Запуск бота
bot.launch().then(() => {
    console.log('Catalog Bot started successfully');
}).catch((err) => {
    console.error('Failed to start bot:', err);
});

// Включаем graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 