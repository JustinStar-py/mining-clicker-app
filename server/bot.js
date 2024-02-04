require('dotenv').config();
const axios = require('axios');
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.REACT_APP_TELEGRAM_BOT_TOKEN);

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice();
  return `${day}/${month}/${year}`;
}

function getLeague(points) {
  if (points > 10000) {
    return 'Diamond';
  } else if (points > 5000) {
    return 'Premium';
  } else if (points > 2000) {
    return 'Gold';
  } else if (points > 500) {
    return 'Silver';
  } else if (points > 0) {
    return 'Bronze';
  } else {
    return 'Nobe';
  }
}

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
          [{ text: 'Show Profile 🌀', callback_data: 'show_profile' }, {text: 'Top Players 🔥', callback_data: 'leaderboard'}]
        ]
      },
      parse_mode: 'HTML'
    }
  );
});

bot.action('show_profile', (ctx) => {
  ctx.deleteMessage();
  let rank;
  
  // get user rank
  axios.get(`http://127.0.0.1:4000/user/${ctx.from.id}/get-rank`)
    .then((response) => {
        rank = response.data.rank
        
  }).finally(() => {
    // get user info by api
    axios.get(`http://127.0.0.1:4000/user/${ctx.from.id}`)
    .then((response) => {
        const points = response.data.points;
        const joinedAt = response.data.createdAt;
        ctx.reply(`<b>+-----------------------------+</b>
| Profile @${ctx.from.username} |
<b>+-------------------------------+</b>
| <b>🏆 ${getLeague(points)} League </b> 
| <b>🎗 Balance :</b> ${points}         
| <b>🔥 Ranking :</b> ${rank}            
| <b>🪸  Joined :</b> ${formatDate(new Date(joinedAt))}
<b>+-------------------------------+</b>`, {
          parse_mode: 'HTML'
        })        
    })      
  })
})

bot.action('leaderboard', (ctx) => {
  ctx.deleteMessage();
  axios.get('http://127.0.0.1:4000/leaderboard')
  .then((response) => {
    let li = ''
    response.data.users.map((user, index) => {
      li += `<b>${index + 1} - <a href="tg://user?id=${user.userId}">${user.username}</a> : ${user.points}\n</b>`
    })
    ctx.replyWithHTML('⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶\n<b>⣶🏆 Leaderboard 🏆⣶</b>\n⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶\n\n' + li, {parse_mode: 'HTML'});
  })
})

bot.launch( );

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot }