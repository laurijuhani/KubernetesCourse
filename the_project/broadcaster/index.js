const { connect, StringCodec } = require('nats');

const NATS_URL = process.env.NATS_URL; 
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const LOGGING_ONLY = process.env.BROADCASTER_MODE === 'log'; 

const sc = StringCodec();

const main = async () => {
  const nc = await connect({ servers: NATS_URL });

  const sub = nc.subscribe('todo', { queue: 'broadcaster' });

  for await (const m of sub) {
    const msg = JSON.parse(sc.decode(m.data));    
    const { event, todo } = msg;
    const actualTodo = todo.todo;
    const message = `Event: ${event}\nId: ${actualTodo.id}\nTodo: ${actualTodo.todo}\nCompleted: ${actualTodo.completed}`;
    if (LOGGING_ONLY) {
      console.log(message);
    } else {
      await sendTelegramMessage(message);
    }
  }
}; 

const sendTelegramMessage = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    }),
  });
};

main(); 