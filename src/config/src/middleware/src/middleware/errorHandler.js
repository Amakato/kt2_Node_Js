const config = require('../config');

module.exports = (err, req, res, next) => {
  console.error(`[Error Handler]: ${err.stack || err.message}`);

  // Перехват ошибок лимитов или валидации файлов от Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Размер файла превышает допустимый лимит (2 МБ)' });
  }
  if (err.message === 'Разрешены только изображения форматов JPEG и PNG') {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Внутренняя ошибка сервера',
    ...(config.env === 'development' && { stack: err.stack })
  });
};