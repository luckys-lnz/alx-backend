import { createClient } from 'redis';
import express from 'express';
import { promisify } from 'util';

const app = express();
const redisClient = createClient();

redisClient.on('connect', () => {
  console.log('Redis client connected to the server');
});

redisClient.on('error', (err) => {
  console.error(`Redis client not connected to the server: ${err}`);
});

const get = promisify(redisClient.get).bind(redisClient);

const listProducts = [
  { itemId: 1, itemName: 'Suitcase 250', price: 50, initialAvailableQuantity: 4 },
  { itemId: 2, itemName: 'Suitcase 450', price: 100, initialAvailableQuantity: 10 },
  { itemId: 3, itemName: 'Suitcase 650', price: 350, initialAvailableQuantity: 2 },
  { itemId: 4, itemName: 'Suitcase 1050', price: 550, initialAvailableQuantity: 5 },
];

function getItemById(id) {
  return listProducts.find((item) => item.itemId === id);
}

function reserveStockById(itemId, stock) {
  redisClient.set(`item.${itemId}.stock`, stock);
}

async function getCurrentReservedStockById(itemId) {
  try {
    const stock = await get(`item.${itemId}.stock`);
    return stock !== null ? parseInt(stock) : null;
  } catch (err) {
    console.error(`Error fetching stock for item ${itemId}: ${err}`);
    return null;
  }
}

// Routes
app.get('/list_products', (req, res) => {
  res.json(listProducts);
});

app.get('/list_products/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  if (isNaN(itemId)) {
    return res.status(400).json({ status: 'Invalid itemId' });
  }

  const item = getItemById(itemId);
  if (!item) {
    return res.status(404).json({ status: 'Product not found' });
  }

  const stock = await getCurrentReservedStockById(itemId);
  res.json({
    itemId: item.itemId,
    itemName: item.itemName,
    price: item.price,
    initialAvailableQuantity: item.initialAvailableQuantity,
    currentQuantity: stock !== null ? stock : item.initialAvailableQuantity,
  });
});

app.get('/reserve_product/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  if (isNaN(itemId)) {
    return res.status(400).json({ status: 'Invalid itemId' });
  }

  const item = getItemById(itemId);
  if (!item) {
    return res.status(404).json({ status: 'Product not found' });
  }

  let currentStock = await getCurrentReservedStockById(itemId);
  currentStock = currentStock !== null ? currentStock : item.initialAvailableQuantity;

  if (currentStock <= 0) {
    return res.json({ status: 'Not enough stock available', itemId });
  }

  reserveStockById(itemId, currentStock - 1);
  res.json({ status: 'Reservation confirmed', itemId });
});

const port = 1245;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
