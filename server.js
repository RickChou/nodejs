const express = require('express');
const path = require('path');
const mqtt = require('mqtt');
const app = express();

// MQTT 設定
const client = mqtt.connect('wss://c15f9e95fc2e43a8bc949b3b4849d189.s1.eu.hivemq.cloud:8884/mqtt', {
  username: 'aaeonshm487',
  password: 'Aaeonm487'
});

let espState = {
  power: false,
  color: { r: 255, g: 255, b: 255 }
};

client.on('connect', () => {
  console.log('MQTT connected');
  client.subscribe('server_recv');  // 訂閱 ESP32 回傳狀態
});

client.on('message', (topic, message) => {
  const payload = message.toString();
  console.log(`收到 ESP32 訊息: ${topic} → ${payload}`);
  
  if (topic === 'server_recv') {
    if (payload === 'relay open OK') {
      espState.power = true;
    } else if (payload === 'relay close OK') {
      espState.power = false;
    } else if (payload.startsWith('color:')) {
      // 假設 ESP32 發 color:R,G,B
      const parts = payload.slice(6).split(',');
      espState.color = { r: +parts[0], g: +parts[1], b: +parts[2] };
    }
  }
});

// HTTP API
app.get('/api/on', (req, res) => {
  client.publish('device_recv', 'open relay');
  espState.power = true;
  res.json({ status: 'ok', power: true });
});

app.get('/api/off', (req, res) => {
  client.publish('device_recv', 'close relay');
  espState.power = false;
  res.json({ status: 'ok', power: false });
});

app.get('/api/rgb', (req, res) => {
  const { r, g, b } = req.query;
  if (r !== undefined && g !== undefined && b !== undefined) {
    client.publish('home/light/color', `${r},${g},${b}`);
    espState.color = { r: +r, g: +g, b: +b };
    res.json({ status: 'ok', color: espState.color });
  } else {
    res.status(400).json({ status: 'error', msg: '缺少 r/g/b' });
  }
});

app.get('/api/status', (req, res) => {
  res.json(espState);
});

// 靜態網頁
app.use(express.static(__dirname));

// 所有其他路由導向 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 監聽 PORT
app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on PORT:', process.env.PORT || 3000);
});
