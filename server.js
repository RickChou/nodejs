const express = require('express');
const app = express();

app.use(express.static(__dirname));

app.get('/rgb', (req, res) => {
  const {r,g,b} = req.query;
  console.log(`燈泡顏色 → RGB(${r},${g},${b})`);
  // 在這裡你可以接 ESP32、ESP8266、MQTT、WebSocket、UART… 隨你
  res.sendStatus(200);
});

app.get('/off', (req, res) => {
  console.log("燈泡關閉");
  res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('調色盤上線：', port));
