const mineflayer = require('mineflayer');
const express = require('express');

// 1. ВСТРОЕННЫЙ ВЕБ-СЕРВЕР ДЛЯ RENDER.COM
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Бот активен! Выходит, если есть люди, и заходит, если сервер пуст.');
});

app.listen(PORT, () => {
  console.log([Web] Сервер запущен на порту ${PORT} для Render);
});

// 2. НАСТРОЙКИ MINECRAFT БОТА
const botOptions = {
  host: '95.216.20.55', 
  port: 29367,          
  username: 'AFK_Bot_Helper',   
  version: "1.21.11"
};

let bot;
let afkInterval;
let reconnectTimeout;

function createBot() {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  
  bot = mineflayer.createBot(botOptions);

  bot.on('spawn', () => {
    console.log('[MC] Бот успешно зашел на сервер!');
    
    // Авторизация на сервере
    setTimeout(() => {
      if (bot && bot.chat) {
        bot.chat('/register superpassword123 superpassword123');
        bot.chat('/login superpassword123');
      }
    }, 2000);

    // Включаем постоянный шифт
    setTimeout(() => {
      if (bot && bot.entity) bot.setControlState('sneak', true);
    }, 3000);

    if (afkInterval) clearInterval(afkInterval);

    // Прыгаем раз в минуту на шифте
    afkInterval = setInterval(() => {
      if (bot && bot.entity) {
        bot.setControlState('jump', true); 
        setTimeout(() => {
          if (bot && bot.entity) {
            bot.setControlState('jump', false) or bot.setControlState('sneak', true); 
          }
        }, 500); 
      }
    }, 60000);

    // ПРОВЕРКА ПРИ СПАВНЕ
    setTimeout(() => {
      if (bot && bot.players) {
        const playerCount = Object.keys(bot.players).length;
        if (playerCount > 1) {
          console.log([MC] На сервере обнаружены люди (${playerCount} игрок(ов)). Бот уступает место.);
          if (afkInterval) clearInterval(afkInterval);
          bot.quit();
        }
      }
    }, 5000);
  });

  bot.on('playerJoined', (player) => {
    if (!bot || !bot.players) return;
    if (player.username !== bot.username) {
      console.log([MC] Игрок ${player.username} зашел на сервер. Бот отключается.);
      if (afkInterval) clearInterval(afkInterval);
      bot.quit(); 
    }
  });

  bot.on('end', () => { 
    console.log('[MC] Бот отключился от сервера.'); 
    if (afkInterval) clearInterval(afkInterval);
    
    reconnectTimeout = setTimeout(() => {
      console.log('[MC] Проверяем сервер на доступность...');
      createBot();
    }, 180000); // 3 минуты
  });
  
  bot.on('error', (err) => console.log('[MC] Ошибка бота: ', err));
}

createBot();
