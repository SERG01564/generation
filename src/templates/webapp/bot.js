import { Telegraf } from 'telegraf';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import archiver from 'archiver';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint для генерации бота
app.post('/api/generate', async (req, res) => {
    try {
        const { botType, botName, botToken, openaiKey } = req.body;

        // Создаем временную директорию для проекта
        const tempDir = path.join(__dirname, 'temp', botName);
        await fs.ensureDir(tempDir);

        // Копируем шаблон
        const templateDir = path.join(__dirname, '..', '..', 'templates', botType);
        await fs.copy(templateDir, tempDir);

        // Создаем .env файл
        const envContent = `BOT_TOKEN=${botToken}\n`;
        if (botType === 'ai' && openaiKey) {
            envContent += `OPENAI_API_KEY=${openaiKey}\n`;
        }
        await fs.writeFile(path.join(tempDir, '.env'), envContent);

        // Создаем архив
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        const zipPath = path.join(__dirname, 'temp', `${botName}.zip`);
        const output = fs.createWriteStream(zipPath);

        archive.pipe(output);
        archive.directory(tempDir, false);
        await archive.finalize();

        // Отправляем архив
        res.download(zipPath, `${botName}.zip`, async (err) => {
            if (err) {
                console.error('Ошибка при отправке файла:', err);
            }
            // Удаляем временные файлы
            await fs.remove(tempDir);
            await fs.remove(zipPath);
        });

    } catch (error) {
        console.error('Ошибка при генерации бота:', error);
        res.status(500).json({ error: 'Ошибка при создании бота' });
    }
});

// Обработка корневого маршрута
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запускаем сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

// Запускаем бота
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