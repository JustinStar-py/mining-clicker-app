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
    return '👑 Platinum';
  } else if (points > 5000) {
    return '💎 Diamond';
  } else if (points > 2000) {
    return '🏆 Gold';
  } else if (points > 500) {
    return '🥈 Silver';
  } else if (points > 0) {
    return '🥉 Bronze';
  } else {
    return 'Nobe';
  }
}

function getMenu() {
  return [
    [{ text: 'Play Now! 🎡', web_app: { url: 'https://app.sendchain.io/' }}],
    [{ text: 'Show Profile 🌀', callback_data: 'show_profile' }, {text: 'Leaderboard 🔥', callback_data: 'leaderboard'}],
    [{ text: 'Referral Link 🎁', callback_data: 'referral' }, { text: 'Community 👥', url:'https://t.me/p2p_js'}]
  ]
}

// Store referrals in a map for simplicity, use a database in production
const referrals = new Map();

bot.start((ctx) => {
  const refId = ctx.message.text.split(' ')[1];
  if (refId) {
    referrals.set(ctx.message.from.id, refId);
    axios.post('https://app.sendchain.io/api/referral', {
      referredId: ctx.message.from.id,
      referrerId: refId,
      firstname: ctx.message.from.first_name,
      lastname: ctx.message.from.last_name ? ctx.message.from.last_name : '',
      username: ctx.message.from.username ? ctx.message.from.username : 'Anonymous',
    }).then(() => {
      ctx.reply(`You invited by ${refId} to join the SendChain Bot.`);
      bot.telegram.sendMessage(chat_id=Number(refId), text=`🪼 You invited your friend <a href="tg://user?id=${ctx.message.from.id}">${ctx.message.from.first_name}</a>! 🎉\n👀 Check your referrals by /referral`, 
        { 
          parse_mode: 'HTML'
        }
      )
    }).catch((error) => {
      // console.error('Referral error:', error);
      ctx.reply(`Error for inviting ${refId} to join the SendChain Bot.`);
    })
  }

  ctx.reply(
    `<b>Hi, dear <a href="tg://user?id=${ctx.message.from.id}">${ctx.message.from.first_name}</a>! This is SendChain Bot 👋!</b> \n
<b>Tap on the coin and watch your $SEND grow.</b>`, 
    { 
      reply_markup: {
        inline_keyboard: getMenu()
      },
      parse_mode: 'HTML'
    }
  );
});

// Add a command that gives the user their referral link
bot.command('referral', (ctx) => {
  let referrals = 0;
  axios.get(`https://app.sendchain.io/api/user/${ctx.from.id}`)
  .then((response) => {
     referrals = response.data.referrals;
  }).catch((error) => {
    console.error('Referral error:', error);
  })
  .finally(() => {
    ctx.replyWithHTML(`<b>Invite your friends and get bonuses for each invited friend! 🎁
\n🎗Referral link: </b><code>https://t.me/SendChain_bot?start=${ctx.message.from.id}</code>
        \n<b>Your referrals : ${referrals}</b>`, {
          reply_markup: {
            inline_keyboard: [[{text: 'Back to menu', callback_data: 'menu'}]]
          }   
     });
  });
});

bot.action('referral', (ctx) => {
  ctx.deleteMessage();
  
  let referrals = 0;
  axios.get(`https://app.sendchain.io/api/user/${ctx.from.id}`)
  .then((response) => {
     referrals = response.data.referrals;
  })
  .catch((error) => {
    console.error('Referral error:', error);
  })
  .finally(() => {
    ctx.replyWithHTML(`<b>Invite your friends and get bonuses for each invited friend! 🎁
\n🎗Referral link: </b><code>https://t.me/SendChain_bot?start=${ctx.from.id}</code>
    \n<b>Your referrals : ${referrals}</b>`, {
      reply_markup: {
        inline_keyboard: [[{text: 'Back to menu', callback_data: 'menu'}]]
      }   
     });
   });
}) 

bot.action('show_profile', (ctx) => {
  ctx.deleteMessage();
  let rank;
  
  // get user rank
  axios.get(`https://app.sendchain.io/api/user/${ctx.from.id}/get-rank`)
    .then((response) => {
        rank = response.data.rank;      
  }).finally(() => {
    // get user info by api
    axios.get(`https://app.sendchain.io/api/user/${ctx.from.id}`)
    .then((response) => {
        const points = response.data.points;
        const joinedAt = response.data.createdAt;
        const referrals = response.data.referrals;
        ctx.reply(`Profile @${ctx.from.username}
\n<b>${getLeague(points)} League </b> 
<b>🎗 Balance :</b> ${points}         
<b>🔥 Ranking :</b> ${rank}     
<b>👥 Referrals :</b> ${referrals}       
<b>🪸  Joined :</b> ${formatDate(new Date(joinedAt))}
`,       { reply_markup: {
             inline_keyboard: [[{text: 'Back to menu', callback_data: 'menu'}]]
          },
          parse_mode: 'HTML'
        })        
    })      
  })
})

bot.action('leaderboard', (ctx) => {
  ctx.deleteMessage();
  axios.get('https://app.sendchain.io/api/leaderboard')
  .then((response) => {
    let li = ''
    response.data.users.map((user, index) => {
      li += `<b>${index + 1} - <a href="tg://user?id=${user.userId}">${user.username}</a> : ${user.points}\n</b>`
    })
    ctx.replyWithHTML('<b>⣶🏆 Leaderboard 🏆⣶</b>\n\n' + li, 
    { reply_markup: {
          inline_keyboard: [[{text: 'Back to menu', callback_data: 'menu'}]]
      }
   });
  })
})

bot.action('menu', (ctx) => {
  ctx.deleteMessage();
  ctx.replyWithHTML('<b>Welcome back @' + ctx.from.username + ' to menu </b>', {
    reply_markup: {
      inline_keyboard: getMenu()
    },
    parse_mode: 'HTML'
  })
})

bot.launch( );

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot }