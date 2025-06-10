document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('botForm');
    const botTypeSelect = document.getElementById('botType');
    const openaiKeyContainer = document.getElementById('openaiKeyContainer');
    const resultDiv = document.getElementById('result');

    // Показываем/скрываем поле для OpenAI API Key
    botTypeSelect.addEventListener('change', () => {
        if (botTypeSelect.value === 'ai') {
            openaiKeyContainer.classList.remove('hidden');
        } else {
            openaiKeyContainer.classList.add('hidden');
        }
    });

    // Обработка отправки формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Получаем данные формы
        const formData = {
            botType: botTypeSelect.value,
            botName: document.getElementById('botName').value,
            botToken: document.getElementById('botToken').value,
            openaiKey: document.getElementById('openaiKey').value
        };

        // Валидация
        if (!formData.botName || !formData.botToken) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        if (formData.botType === 'ai' && !formData.openaiKey) {
            showNotification('Для ИИ-бота необходимо указать OpenAI API Key', 'error');
            return;
        }

        try {
            // Показываем индикатор загрузки
            form.classList.add('loading');
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Создание бота...';

            // Отправляем запрос на сервер
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.details || errorData.error || 'Ошибка при создании бота');
                } else {
                    throw new Error('Ошибка при создании бота');
                }
            }

            // Проверяем, является ли ответ ZIP-файлом
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/zip')) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${formData.botName}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Показываем результат
                resultDiv.classList.remove('hidden');
                resultDiv.classList.add('fade-in');

                showNotification('Бот успешно создан!', 'success');
            } else {
                throw new Error('Неверный формат ответа от сервера');
            }

        } catch (error) {
            console.error('Ошибка:', error);
            showNotification(error.message, 'error');
        } finally {
            // Возвращаем форму в исходное состояние
            form.classList.remove('loading');
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Создать бота';
        }
    });
});

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Добавляем стили в зависимости от типа уведомления
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-100', 'text-green-700', 'border-green-400');
            break;
        case 'error':
            notification.classList.add('bg-red-100', 'text-red-700', 'border-red-400');
            break;
        default:
            notification.classList.add('bg-blue-100', 'text-blue-700', 'border-blue-400');
    }

    document.body.appendChild(notification);

    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 