/**
 * Глобальный конфиг приложения
 */
const MATRIX_CONFIG = {
    dataSource: 'list.json',
    autoRefresh: true,
    refreshInterval: 10000
};

/**
 * Кешируем ссылки на контейнеры квадрантов
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
    // Защита: если title пустой, не рендерим ничего
    if (!item.title) return '';

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
 * Очистка всех квадрантов матрицы
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
        
        clearMatrix();

        wishlistItems.forEach(item => {
            // Защита от пустых объектов в JSON
            if (!item || Object.keys(item).length === 0) return;

            // Принудительно приводим квадрант к числу (парсим "2" в 2)
            const quadrantNumber = parseInt(item.quadrant, 10);
            const targetContainer = matrixContainers[quadrantNumber];
            
            if (targetContainer) {
                const cardHTML = createCardHTML(item);
                if (cardHTML) {
                    targetContainer.insertAdjacentHTML('beforeend', cardHTML);
                }
            } else {
                console.warn(`Обнаружен неизвестный квадрант (${item.quadrant}) для: "${item.title}"`);
            }
        });

    } catch (error) {
        console.error('Критическая ошибка при инициализации матрицы:', error);
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
 * Точка входа
 */
document.addEventListener('DOMContentLoaded', () => {
    renderWishlist();
    if (MATRIX_CONFIG.autoRefresh) {
        setInterval(renderWishlist, MATRIX_CONFIG.refreshInterval);
    }
});
