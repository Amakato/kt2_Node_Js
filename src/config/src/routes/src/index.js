const express = require('express');
const path = require('path');
const config = require('./config');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const productRoutes = require('./routes/products');

const app = express();

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Статический доступ к файлам
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Маршруты API
app.use('/api/products', productRoutes);

// Заглушка для некорректных путей
app.use((req, res, next) => {
  const error = new Error('Ресурс не найден');
  error.status = 404;
  next(error);
});

// Глобальный обработчик ошибок
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Сервер запущен в режиме [${config.env}] на порту: ${config.port}`);
});