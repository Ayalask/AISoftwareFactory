const express = require('express');
const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/build-id', (req, res) => {
  res.json({ id: 'initial-skeleton' });
});

app.get('/', (req, res) => {
  res.send('<html><body style=" font-family:sans-serif
