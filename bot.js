require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.REACT_APP_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('Welcome! Click the button below to open the mini app.', Markup.inlineKeyboard([
    Markup.button.webApp('Open Mini App', 'https://justinstar-py.github.io/mining-mini-app/')
  ]));
});

bot.launch( );

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));