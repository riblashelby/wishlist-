/**
 * Глобальный конфиг приложения
 */
const MATRIX_CONFIG = {
    dataSource: 'list.json',    // Путь к файлу с данными
    autoRefresh: true,          // Включить автообновление без перезагрузки страницы
    refreshInterval: 10000      // Интервал обновления в миллисекундах (10 секунд)
};

/**
 * Кешируем ссылки на контейнеры квадрантов, 
 * чтобы не искать их в DOM при каждом запросе
 */
const matrixContainers = {
    1: document.getElementById('container-q1'),
    2: document.getElementById('container-q2'),
    3: document.getElementById('container-q3'),
    4: document.getElementById('container-q4')
};

/**
 * Генерация HTML-структуры для карточки желания
 */
function createCardHTML(item) {
    const priceHTML = item.price ? `<p class="price">${item.price}</p>` : '';
    const linkHTML = item.link 
        ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="item-link">Ссылка</a>` 
        : '';

    return `
        <div class="wish-item">
            <div class="item-content">
                <h3>${item.title}</h3>
                ${priceHTML}
            </div>
            ${linkHTML}
        </div>
    `;
}

/**
 * Очистка всех квадрантов матрицы перед заливкой новых данных
 */
function clearMatrix() {
    Object.values(matrixContainers).forEach(container => {
        if (container) container.innerHTML = '';
    });
}

/**
 * Основная функция запроса данных и перерисовки интерфейса
 */
async function renderWishlist() {
    try {
        const response = await fetch(MATRIX_CONFIG.dataSource);
        
        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
        }

        const wishlistItems = await response.json();
        
        // Очищаем старые карточки перед рендером новых
        clearMatrix();

        // Распределяем элементы по квадрантам
        wishlistItems.forEach(item => {
            const targetContainer = matrixContainers[item.quadrant];
            
            if (targetContainer) {
                targetContainer.insertAdjacentHTML('beforeend', createCardHTML(item));
            } else {
                console.warn(`Обнаружен неизвестный квадрант (${item.quadrant}) для: "${item.title}"`);
            }
        });

    } catch (error) {
        console.error('Критическая ошибка при инициализации матрицы:', error);
        
        // Выводим ошибку пользователю в первый квадрант
        if (matrixContainers[1]) {
            matrixContainers[1].innerHTML = `
                <p style="color: var(--color-q1); font-size: 0.9rem; padding: 0.5rem;">
                    Не удалось загрузить данные. Проверьте консоль или файл list.json.
                </p>
            `;
        }
    }
}

/**
 * Точка входа. Ждем полной готовности DOM-дерева
 */
document.addEventListener('DOMContentLoaded', () => {
    // Первый запуск при открытии страницы
    renderWishlist();

    // Если в конфиге включен автоапдейт — запускаем таймер
    if (MATRIX_CONFIG.autoRefresh) {
        setInterval(renderWishlist, MATRIX_CONFIG.refreshInterval);
    }
});
