import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateBot() {
    try {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'botType',
                message: 'Выберите тип бота:',
                choices: ['quiz', 'request', 'catalog', 'ai', 'webapp']
            },
            {
                type: 'input',
                name: 'botName',
                message: 'Введите имя бота:',
                validate: input => input.trim() !== '' ? true : 'Имя бота не может быть пустым'
            },
            {
                type: 'input',
                name: 'botToken',
                message: 'Введите токен бота:',
                validate: input => input.trim() !== '' ? true : 'Токен бота не может быть пустым'
            },
            {
                type: 'input',
                name: 'openaiKey',
                message: 'Введите OpenAI API ключ (только для AI бота):',
                when: answers => answers.botType === 'ai'
            }
        ]);

        const { botType, botName, botToken, openaiKey } = answers;
        const templateDir = path.join(__dirname, 'templates', botType);
        const targetDir = path.join(process.cwd(), botName);

        // Копируем шаблон
        await fs.copy(templateDir, targetDir);

        // Создаем .env файл
        const envContent = `BOT_TOKEN=${botToken}\n`;
        if (botType === 'ai' && openaiKey) {
            envContent += `OPENAI_API_KEY=${openaiKey}\n`;
        }
        await fs.writeFile(path.join(targetDir, '.env'), envContent);

        console.log(`\n✅ Бот "${botName}" успешно создан!\n`);
        console.log('Для запуска бота:');
        console.log(`1. cd ${botName}`);
        console.log('2. npm install');
        console.log('3. npm start\n');

    } catch (error) {
        console.error('Ошибка при создании бота:', error);
    }
}

generateBot(); 