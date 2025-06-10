import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function checkStructure() {
    try {
        // Проверяем основные директории
        const dirs = [
            'src/templates',
            'src/templates/quiz',
            'src/templates/request',
            'src/templates/catalog',
            'src/templates/ai',
            'src/templates/webapp',
            'temp'
        ];

        for (const dir of dirs) {
            const dirPath = path.join(__dirname, dir);
            if (!await fs.pathExists(dirPath)) {
                console.log(`Creating directory: ${dir}`);
                await fs.ensureDir(dirPath);
            } else {
                console.log(`Directory exists: ${dir}`);
            }
        }

        // Проверяем наличие шаблонов
        const templates = [
            'quiz/bot.js',
            'request/bot.js',
            'catalog/bot.js',
            'ai/bot.js',
            'webapp/bot.js'
        ];

        for (const template of templates) {
            const templatePath = path.join(__dirname, 'src/templates', template);
            if (!await fs.pathExists(templatePath)) {
                console.error(`Template not found: ${template}`);
            } else {
                console.log(`Template exists: ${template}`);
            }
        }

        console.log('Structure check completed');
    } catch (error) {
        console.error('Error checking structure:', error);
    }
}

checkStructure(); 