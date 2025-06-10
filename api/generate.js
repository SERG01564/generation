import { Telegraf } from 'telegraf';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import archiver from 'archiver';
import dotenv from 'dotenv';
import cors from 'cors';
import os from 'os';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint для генерации бота
export default async function handler(req, res) {
    console.log('Received request:', req.method, req.url);
    console.log('Request body:', req.body);

    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { botType, botName, botToken, openaiKey } = req.body;
        console.log('Processing request for bot:', { botType, botName });

        // Валидация входных данных
        if (!botType || !botName || !botToken) {
            console.log('Missing required fields:', { botType, botName, botToken });
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: {
                    botType: !botType ? 'Required' : 'OK',
                    botName: !botName ? 'Required' : 'OK',
                    botToken: !botToken ? 'Required' : 'OK'
                }
            });
        }

        // Создаем временную директорию для проекта
        const tempDir = path.join(os.tmpdir(), botName);
        console.log('Creating temp directory:', tempDir);
        await fs.ensureDir(tempDir);

        // Копируем шаблон
        const templateDir = path.join(__dirname, '..', 'src', 'templates', botType);
        console.log('Looking for template in:', templateDir);
        
        if (!await fs.pathExists(templateDir)) {
            console.log('Template directory not found:', templateDir);
            return res.status(400).json({ 
                error: 'Invalid bot type',
                details: `Template directory for ${botType} not found`
            });
        }

        console.log('Copying template files...');
        await fs.copy(templateDir, tempDir);
        console.log('Template files copied successfully');

        // Создаем .env файл
        const envContent = `BOT_TOKEN=${botToken}\n`;
        if (botType === 'ai' && openaiKey) {
            envContent += `OPENAI_API_KEY=${openaiKey}\n`;
        }
        const envPath = path.join(tempDir, '.env');
        console.log('Creating .env file at:', envPath);
        await fs.writeFile(envPath, envContent);
        console.log('.env file created successfully');

        // Создаем архив
        console.log('Creating zip archive...');
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        const zipPath = path.join(os.tmpdir(), `${botName}.zip`);
        console.log('Zip file will be saved to:', zipPath);
        const output = fs.createWriteStream(zipPath);

        archive.pipe(output);
        archive.directory(tempDir, false);

        // Обработка ошибок архивации
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            throw err;
        });

        output.on('error', (err) => {
            console.error('Output stream error:', err);
            throw err;
        });

        await archive.finalize();
        console.log('Archive created successfully');

        // Отправляем архив
        console.log('Sending archive to client...');
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${botName}.zip`);
        
        const fileStream = fs.createReadStream(zipPath);
        fileStream.pipe(res);

        fileStream.on('end', async () => {
            console.log('File sent successfully, cleaning up...');
            try {
                await fs.remove(tempDir);
                await fs.remove(zipPath);
                console.log('Cleanup completed successfully');
            } catch (cleanupErr) {
                console.error('Cleanup error:', cleanupErr);
            }
        });

        fileStream.on('error', (err) => {
            console.error('Error sending file:', err);
            throw err;
        });

    } catch (error) {
        console.error('Error in bot generation:', error);
        res.status(500).json({ 
            error: 'Error creating bot',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
} 