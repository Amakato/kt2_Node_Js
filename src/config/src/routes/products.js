const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

// In-Memory база данных для примера
let products = [];

// Схемы валидации Joi
const getProductsSchema = Joi.object({
  category: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

const productBodySchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().required()
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().required()
});

// GET /api/products (Фильтрация и пагинация)
router.get('/', validate(getProductsSchema), (req, res) => {
  let { category, minPrice, maxPrice, page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  let filtered = [...products];

  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (minPrice) {
    filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
  }

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedData = filtered.slice(startIndex, endIndex);

  res.json({
    data: paginatedData,
    total,
    page,
    limit
  });
});

// GET /api/products/:id
router.get('/:id', validate(idParamSchema), (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Товар не найден' });
  res.json(product);
});

// POST /api/products (Создание товара с загрузкой изображения)
router.post('/', upload.single('image'), validate(productBodySchema), (req, res) => {
  const { name, price, category } = req.body;
  
  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    name,
    price: parseFloat(price),
    category,
    image: req.file ? `/uploads/products/${req.file.filename}` : null
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id
router.put('/:id', upload.single('image'), validate(idParamSchema.concat(productBodySchema)), (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) return res.status(404).json({ message: 'Товар не найден' });

  const { name, price, category } = req.body;
  
  products[index] = {
    ...products[index],
    name,
    price: parseFloat(price),
    category,
    ...(req.file && { image: `/uploads/products/${req.file.filename}` })
  };

  res.json(products[index]);
});

// DELETE /api/products/:id
router.delete('/:id', validate(idParamSchema), (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) return res.status(404).json({ message: 'Товар не найден' });

  products.splice(index, 1);
  res.status(204).send();
});

module.exports = router;