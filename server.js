const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- НАСТРОЙКИ ---
const ADMIN_PASSWORD = "1234"; // Твой пароль
// -----------------

const DB_PRODUCTS = path.join(__dirname, 'products.json');
const DB_ORDERS = path.join(__dirname, 'orders.json');

// Инициализация БД (файлы создадутся сами на сервере)
if (!fs.existsSync(DB_PRODUCTS)) fs.writeJsonSync(DB_PRODUCTS, []);
if (!fs.existsSync(DB_ORDERS)) fs.writeJsonSync(DB_ORDERS, []);

// ГЛАВНАЯ СТРАНИЦА: Отдаем index.html из корня проекта
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Получить все товары
app.get('/api/products', async (req, res) => {
    try {
        const products = await fs.readJson(DB_PRODUCTS);
        res.json(products);
    } catch (err) {
        res.json([]);
    }
});

// Добавить товар
app.post('/api/products', async (req, res) => {
    const { password, product } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).send('Wrong password');
    
    const products = await fs.readJson(DB_PRODUCTS);
    products.push({ ...product, id: Date.now() });
    await fs.writeJson(DB_PRODUCTS, products);
    res.json({ success: true });
});

// Удалить товар
app.delete('/api/products/:id', async (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).send('Wrong password');
    
    let products = await fs.readJson(DB_PRODUCTS);
    products = products.filter(p => p.id != req.params.id);
    await fs.writeJson(DB_PRODUCTS, products);
    res.json({ success: true });
});

// Создать заказ
app.post('/api/orders', async (req, res) => {
    const order = req.body;
    const orders = await fs.readJson(DB_ORDERS);
    orders.push({ ...order, id: Date.now(), date: new Date().toLocaleString() });
    await fs.writeJson(DB_ORDERS, orders);
    res.json({ success: true });
});

// Получить заказы
app.post('/api/get-orders', async (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) return res.status(403).send('Wrong password');
    const orders = await fs.readJson(DB_ORDERS);
    res.json(orders);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
