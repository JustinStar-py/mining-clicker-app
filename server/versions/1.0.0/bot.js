require('dotenv').config();
require('axios');
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.REACT_APP_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    `<b>Welcome dear <a href="tg://user?id=${ctx.message.from.id}">${ctx.message.from.first_name}</a></b>\n
<b> ☃ Happy 2024🎄Well Lets play with tokens easy! </b>\n\n<b>Support : @P2P_JS</b>`, 
    { 
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Play Now! 🎡',
            web_app: { url: 'https://justinstar-py.github.io/mining-mini-app/' }
          }],
          [{ text: 'Show Profile 🌀', callback_data: 'show_profile' }]
        ]
      },
      parse_mode: 'HTML'
    }
  );
});

bot.launch( );

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot }