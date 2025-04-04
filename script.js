// Загрузка данных пользователя из localStorage или создание нового пользователя
function loadUser(username) {
    const savedUser = localStorage.getItem(`sealUser_${username}`);
    if (savedUser) {
        return JSON.parse(savedUser);
    } else {
        return { 
            username: username, 
            score: 0, 
            autoTappers: 0, 
            tapMultiplier: 1,
            isLoggedIn: true
        };
    }
}

// Сохранение данных пользователя
function saveUser(user) {
    localStorage.setItem(`sealUser_${user.username}`, JSON.stringify(user));
}

// При загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Получение элементов DOM
    const loginSection = document.getElementById('login-section');
    const gameSection = document.getElementById('game-section');
    const sealImage = document.getElementById('sealImage');
    const autoTapperButton = document.getElementById('autoTapperButton');
    const tapButton = document.getElementById('tapButton');
    const scoreDisplay = document.getElementById('score');
    const usernameInput = document.getElementById('username');
    const loginButton = document.getElementById('loginButton');
    const userDisplay = document.getElementById('userDisplay');
    const shopContainer = document.getElementById('shop');

    // Объявление пользователя
    let user = null;

    // Предметы для магазина
    const items = Array.from({ length: 10 }, (_, i) => ({
        name: `Тюлень №${i + 1}`,
        cost: (i + 1) * 80,
        income: (i + 1) * 2
    }));

    // Множители для тапа
    const multipliers = [
        { cost: 500, value: 2 },
        { cost: 1000, value: 4 },
        { cost: 5000, value: 8 },
        { cost: 10000, value: 16 }
    ];

    // Обновление интерфейса
    function updateUI() {
        scoreDisplay.textContent = `Монеты: ${user.score}`;
        updateSealImage();
        renderShop();
    }

    // Обновление изображения тюленя в зависимости от прогресса
    function updateSealImage() {
        if (user.score < 1000) {
            sealImage.src = "сема.png";
        } else if (user.score < 10000) {
            sealImage.src = "ChatGPT Image 3 апр. 2025 г., 20_53_19.png";
        } else {
            sealImage.src = "ChatGPT Image 3 апр. 2025 г., 20_32_03.png";
        }
    }

    // Создание анимации монеты
    function createCoinAnimation(x, y, amount) {
        const coin = document.createElement('div');
        coin.className = 'coin-animation';
        coin.style.left = `${x}px`;
        coin.style.top = `${y}px`;
        coin.textContent = `+${amount}`;
        document.body.appendChild(coin);
        
        setTimeout(() => {
            document.body.removeChild(coin);
        }, 1000);
    }

    // Обработчик входа
    loginButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username) {
            user = loadUser(username);
            userDisplay.textContent = `Привет, ${user.username}!`;
            loginSection.style.display = 'none';
            gameSection.style.display = 'block';
            updateUI();
        }
    });

    // Обработчик клика по тюленю
    sealImage.addEventListener('click', (e) => {
        const amount = user.tapMultiplier;
        user.score += amount;
        saveUser(user);
        updateUI();
        
        // Создание анимации монеты
        createCoinAnimation(e.clientX, e.clientY, amount);
    });

    // Альтернативная кнопка для тапа (мобильные устройства)
    tapButton.addEventListener('click', () => {
        const amount = user.tapMultiplier;
        user.score += amount;
        saveUser(user);
        updateUI();
        
        // Создание анимации монеты в центре кнопки
        const rect = tapButton.getBoundingClientRect();
        createCoinAnimation(rect.left + rect.width/2, rect.top, amount);
    });

    // Обработчик покупки авто-таппера
    autoTapperButton.addEventListener('click', () => {
        if (user.score >= 50) {
            user.score -= 50;
            user.autoTappers++;
            saveUser(user);
            updateUI();
        }
    });

    // Рендеринг магазина
    function renderShop() {
        shopContainer.innerHTML = '';
        
        // Создание карточек предметов
        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.classList.add('shop-card');
            card.innerHTML = `
                <h3>${item.name}</h3>
                <p>Цена: ${item.cost} монет</p>
                <p>Доход: +${item.income}/сек</p>
                <button class="buy-item-btn" data-index="${index}">Купить</button>
            `;
            shopContainer.appendChild(card);
        });
        
        // Создание карточек множителей
        multipliers.forEach((multiplier, index) => {
            const card = document.createElement('div');
            card.classList.add('shop-card');
            card.innerHTML = `
                <h3>Множитель x${multiplier.value}</h3>
                <p>Цена: ${multiplier.cost} монет</p>
                <button class="buy-multiplier-btn" data-index="${index}">Купить</button>
            `;
            shopContainer.appendChild(card);
        });
        
        // Добавление обработчиков событий для кнопок покупки
        document.querySelectorAll('.buy-item-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                buyItem(index);
            });
        });
        
        document.querySelectorAll('.buy-multiplier-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                buyMultiplier(index);
            });
        });
    }

    // Функция покупки предмета
    function buyItem(index) {
        if (user.score >= items[index].cost) {
            user.score -= items[index].cost;
            user.autoTappers += items[index].income;
            saveUser(user);
            updateUI();
        }
    }

    // Функция покупки множителя
    function buyMultiplier(index) {
        if (user.score >= multipliers[index].cost) {
            user.score -= multipliers[index].cost;
            user.tapMultiplier = multipliers[index].value;
            saveUser(user);
            updateUI();
        }
    }

    // Автоматическое начисление монет от авто-тапперов
    setInterval(() => {
        if (user) {
            user.score += user.autoTappers;
            saveUser(user);
            updateUI();
        }
    }, 1000);
});