const express = require('express');
const path = require('path');
const app = express();

// Правильные заголовки для Brotli файлов Unity
app.use((req, res, next) => {
  if (req.url.endsWith('.js.br')) {
    res.setHeader('Content-Encoding', 'br');
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith('.wasm.br')) {
    res.setHeader('Content-Encoding', 'br');
    res.setHeader('Content-Type', 'application/wasm');
  } else if (req.url.endsWith('.data.br')) {
    res.setHeader('Content-Encoding', 'br');
    res.setHeader('Content-Type', 'application/octet-stream');
  } else if (req.url.endsWith('.js.gz')) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith('.wasm.gz')) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'application/wasm');
  } else if (req.url.endsWith('.data.gz')) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'application/octet-stream');
  }
  next();
});

// Отдаём статичные файлы из корня
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
