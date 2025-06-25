import { connect, NatsConnection, StringCodec } from 'nats';  

const NATS_URL = process.env.NATS_URL;

const sc = StringCodec();
let natsConnection: NatsConnection | null = null; 

const connectNats = async () => {
  try {
    natsConnection = await connect({ servers: NATS_URL });
    console.log('Connected to NATS server');
  } catch (error) {
    console.error('Failed to connect to NATS:', error);
    throw error;
  }
};


const publishTodoEvent = async (event: string, todo: any) => {
  if (natsConnection) {
    natsConnection.publish("todo", sc.encode(JSON.stringify({ event, todo })));
  }
}; 

export { connectNats, publishTodoEvent }; 