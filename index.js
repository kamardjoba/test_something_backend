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
const webAppUrl = 'https://cosmic-mousse-785ac6.netlify.app';
const mixpanelToken = 'd93f06d54e461eeeab94adbd32b16acc';
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
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    const user = msg.from;

    // Создаем кнопку с WebAppInfo
    const webAppButton = {
        text: "Start",
        web_app: { url: webAppUrl }
    };

    const replyMarkup = {
        inline_keyboard: [[webAppButton]]
    };

    // Отправляем приветственное сообщение с кнопкой
    bot.sendMessage(chatId, `Привет, ${firstName}!`, {
        reply_markup: replyMarkup
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









