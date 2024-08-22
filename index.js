require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3001;
const TelegramBot = require('node-telegram-bot-api');
const Mixpanel = require('mixpanel');
const token = '7477982815:AAHwEnCZlrh_d6X2udQADANXon_Hb3wgxPg';
const mixpanelToken = 'd93f06d54e461eeeab94adbd32b16acc';
const path = require('path');
const bot = new TelegramBot(token, { polling: true });
const mixpanel = Mixpanel.init(mixpanelToken);
const API_KEY = 'AHCO3MMTZPF5ZHYAAAAJMZSUGTJ33HZWFSJWCZPYRGDZSVXFQ3Z3NVB4CW6VALWWZIRSOWY';


app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/getTransaction', async (req, res) => {
    const { boc } = req.query;

    if (!boc) {
        return res.status(400).send('Parameter "boc" is required');
    }

    try {
        const response = await axios.get('https://tonapi.io/v2/transaction', {
            params: { boc },
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (response.status === 200) {
            res.json(response.data);
        } else {
            res.status(response.status).send(`Error: ${response.statusText}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error('Error 404: Resource not found. Check the API URL and path.');
        } else {
            console.error('Error fetching transaction:', error.response ? error.response.data : error.message);
        }
        res.status(500).send(error.response ? error.response.data : 'Error fetching transaction');
    }
});

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
  
    const user = msg.from;

  
    const appUrl = `https://cosmic-mousse-785ac6.netlify.app`;
    const channelUrl = `https://t.me/any_tap`;

    const imagePath = path.join(__dirname, 'images', 'Octies_bot_logo.png');
    
    console.log(`Sending photo from path: ${imagePath}`);
    await bot.sendPhoto(chatId, imagePath, {
      caption: "For 5 TON, you receive a meme NFT that will reward the owner once our main application is launched!",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Go Mint!", web_app: { url: appUrl } },
            { text: 'Join AnyTap Community', url: channelUrl }
          ]
        ]
      }
    }).then(() => {
      console.log('Photo and buttons sent successfully');
    }).catch((err) => {
      console.error('Error sending photo and buttons:', err);
    });

    // Отправка события в Mixpanel
    mixpanel.track('Start Command Used', {
        distinct_id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        chat_id: chatId
    });
});

// Обработка текстовых сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;

    // Исключение команды /start из обработки сообщений
    if (msg.text === '/start') return;

    // Отправка события в Mixpanel
    mixpanel.track('Message Sent', {
        distinct_id: user.id,
        message: msg.text,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        chat_id: chatId
    });
});





app.listen(port, () => {
  console.log(`Сервер работает на порту ${port}`);
});









