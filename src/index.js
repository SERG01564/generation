import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Типы доступных ботов
const BOT_TYPES = {
  QUIZ: 'quiz',
  REQUEST: 'request',
  CATALOG: 'catalog',
  AI: 'ai',
  WEBAPP: 'webapp'
};

// Вопросы для CLI
const questions = [
  {
    type: 'list',
    name: 'botType',
    message: 'Выберите тип бота:',
    choices: [
      { name: 'Квиз-бот', value: BOT_TYPES.QUIZ },
      { name: 'Бот для заявок', value: BOT_TYPES.REQUEST },
      { name: 'Каталог-бот', value: BOT_TYPES.CATALOG },
      { name: 'ИИ-бот (с OpenAI)', value: BOT_TYPES.AI },
      { name: 'Мини-приложение (Web App)', value: BOT_TYPES.WEBAPP }
    ]
  },
  {
    type: 'input',
    name: 'botName',
    message: 'Введите название бота:',
    validate: input => input.length > 0 ? true : 'Название не может быть пустым'
  },
  {
    type: 'input',
    name: 'botToken',
    message: 'Введите токен бота (от @BotFather):',
    validate: input => input.length > 0 ? true : 'Токен не может быть пустым'
  }
];

// Функция генерации проекта
async function generateProject(answers) {
  const { botType, botName, botToken } = answers;
  const projectDir = path.join(process.cwd(), botName);
  
  console.log(chalk.blue(`\nСоздание проекта ${botName}...`));
  
  // Создаем структуру проекта
  await fs.ensureDir(projectDir);
  await fs.ensureDir(path.join(projectDir, 'src'));
  await fs.ensureDir(path.join(projectDir, 'public'));
  
  // Копируем шаблоны
  const templateDir = path.join(__dirname, 'templates', botType);
  await fs.copy(templateDir, projectDir);
  
  // Создаем .env файл
  const envContent = `BOT_TOKEN=${botToken}\n`;
  if (botType === BOT_TYPES.AI) {
    envContent += 'OPENAI_API_KEY=your_openai_api_key\n';
  }
  await fs.writeFile(path.join(projectDir, '.env'), envContent);
  
  // Устанавливаем зависимости
  console.log(chalk.blue('\nУстановка зависимостей...'));
  // TODO: Добавить автоматическую установку через npm
  
  console.log(chalk.green('\nПроект успешно создан!'));
  console.log(chalk.yellow('\nСледующие шаги:'));
  console.log('1. cd ' + botName);
  console.log('2. npm install');
  console.log('3. npm run dev');
}

// Запуск генератора
async function main() {
  console.log(chalk.cyan('=== Telegram Bot Generator ===\n'));
  
  try {
    const answers = await inquirer.prompt(questions);
    await generateProject(answers);
  } catch (error) {
    console.error(chalk.red('Ошибка:'), error);
    process.exit(1);
  }
}

main(); 