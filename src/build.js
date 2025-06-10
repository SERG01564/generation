import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  try {
    console.log('🚀 Начинаем сборку проекта...');

    // Проверяем наличие package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json не найден');
    }

    // Устанавливаем зависимости
    console.log('📦 Устанавливаем зависимости...');
    execSync('npm install', { stdio: 'inherit' });

    // Создаем директорию dist если её нет
    const distPath = path.join(process.cwd(), 'dist');
    await fs.ensureDir(distPath);

    // Копируем необходимые файлы
    console.log('📁 Копируем файлы...');
    const filesToCopy = [
      'src',
      'package.json',
      'package-lock.json',
      '.env'
    ];

    for (const file of filesToCopy) {
      const sourcePath = path.join(process.cwd(), file);
      const destPath = path.join(distPath, file);
      
      if (fs.existsSync(sourcePath)) {
        await fs.copy(sourcePath, destPath);
      }
    }

    // Создаем Procfile для Render
    const procfileContent = 'web: node src/bot.js';
    await fs.writeFile(path.join(distPath, 'Procfile'), procfileContent);

    // Создаем .gitignore
    const gitignoreContent = `
node_modules/
.env
.DS_Store
    `.trim();
    await fs.writeFile(path.join(distPath, '.gitignore'), gitignoreContent);

    console.log('✅ Сборка завершена!');
    console.log('\n📝 Инструкция по деплою:');
    console.log('1. Создайте репозиторий на GitHub');
    console.log('2. Инициализируйте git в папке dist:');
    console.log('   cd dist');
    console.log('   git init');
    console.log('   git add .');
    console.log('   git commit -m "Initial commit"');
    console.log('   git remote add origin <URL вашего репозитория>');
    console.log('   git push -u origin main');
    console.log('\n3. На Render:');
    console.log('   - Создайте новый Web Service');
    console.log('   - Подключите ваш GitHub репозиторий');
    console.log('   - Добавьте переменные окружения:');
    console.log('     BOT_TOKEN=ваш_токен_бота');
    console.log('     WEBAPP_URL=https://ваш-домен.onrender.com (для Web App)');
    console.log('     OPENAI_API_KEY=ваш_ключ_api (для ИИ-бота)');
    console.log('\n4. После деплоя настройте webhook:');
    console.log('   curl -F "url=https://ваш-домен.onrender.com/webhook" https://api.telegram.org/bot<BOT_TOKEN>/setWebhook');

  } catch (error) {
    console.error('❌ Ошибка при сборке:', error);
    process.exit(1);
  }
}

build(); 