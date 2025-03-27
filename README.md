# 🛍️ Интернет-магазин на React

## 📝 Описание
Современный интернет-магазин, разработанный с использованием React. Проект предоставляет удобный интерфейс для покупок онлайн с интуитивно понятной навигацией и приятным дизайном. Магазин включает в себя полноценную систему управления товарами, корзиной и заказами.

## 🚀 Функциональность
- Просмотр каталога товаров с детальной информацией
- Умная система фильтрации и поиска товаров
- Интерактивная корзина покупок с возможностью изменения количества товаров
- Простое оформление заказа в несколько кликов
- Адаптивный дизайн для комфортного использования на всех устройствах
- Система аутентификации пользователей
- Личный кабинет с историей заказов

## 📸 Скриншоты проекта

### Главная страница
![Главная страница](./assets/screenshots/FireShot%20Capture%20001%20-%20React%20App%20-%20localhost.png)
*Главная страница с приветственным баннером и популярными товарами*

### Каталог товаров
![Каталог](./assets/screenshots/FireShot%20Capture%20002%20-%20React%20App%20-%20localhost.png)
*Страница каталога с фильтрами и карточками товаров*

### Детальная страница товара
![Детали товара](./assets/screenshots/FireShot%20Capture%20003%20-%20React%20App%20-%20localhost.png)
*Подробная информация о товаре с возможностью добавления в корзину*

### Корзина покупок
![Корзина](./assets/screenshots/FireShot%20Capture%20004%20-%20React%20App%20-%20localhost.png)
*Корзина с выбранными товарами и возможностью изменения количества*

### Оформление заказа
![Оформление заказа](./assets/screenshots/FireShot%20Capture%20005%20-%20React%20App%20-%20localhost.png)
*Форма оформления заказа с вводом данных доставки*

### Личный кабинет
![Личный кабинет](./assets/screenshots/FireShot%20Capture%20006%20-%20React%20App%20-%20localhost.png)
*Личный кабинет пользователя с историей заказов и настройками*

### Мобильная версия
![Мобильная версия](./assets/screenshots/FireShot%20Capture%20007%20-%20React%20App%20-%20localhost.png)
*Адаптивный дизайн для мобильных устройств*

## 🛠 Стек технологий
### Frontend:
- React.js (хуки, контекст, роутинг)
- React Router DOM 5 для маршрутизации
- TypeScript для типизации
- CSS Modules для стилизации
- Redux Toolkit для управления состоянием

### Backend:
- Node.js
- Express.js
- MongoDB с Mongoose
- JWT для аутентификации

### Дополнительные инструменты:
- Git для версионного контроля
- npm для управления пакетами
- ESLint и Prettier для поддержания качества кода

## ⚙️ Установка и запуск

```bash
# Клонирование репозитория
git clone https://github.com/ваш-юзернейм/shop-project.git

# Переход в директорию проекта
cd shop-project

# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env

# Запуск в режиме разработки
npm run dev

# Сборка проекта
npm run build

# Запуск в продакшн режиме
npm start
```

## 🔧 Требования
### Основные требования:
- Node.js версии 14.0 или выше
- npm версии 6.0 или выше
- MongoDB версии 4.0 или выше
- Современный веб-браузер с поддержкой ES6

### Основные зависимости:
```json
{
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-router-dom": "^5.3.0",
    "redux": "^4.1.0",
    "@reduxjs/toolkit": "^1.6.0",
    "axios": "^0.21.1",
    "mongoose": "^6.0.0",
    "express": "^4.17.1",
    "jsonwebtoken": "^8.5.1"
  }
}
```

### Особенности React Router DOM 5:
- Использование компонента `BrowserRouter` для маршрутизации
- Поддержка вложенных маршрутов
- Защищенные маршруты для авторизованных пользователей
- Редиректы и обработка несуществующих маршрутов
- История навигации

