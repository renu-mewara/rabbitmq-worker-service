const amqplib = require('amqplib');

async function startWorker(workerName, routingKey) {
    const connection = await amqplib.connect('amqp://admin:admin123@localhost');
    const channel = await connection.createChannel();
    await channel.assertExchange('app_exchange', 'topic', { durable: false });
    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, 'app_exchange', routingKey);
    
    console.log(`${workerName} listening for [${routingKey}] events...`);
    
    channel.consume(q.queue, (msg) => { 
        if(msg !== null) {
            const data = JSON.parse(msg.content.toString());
            console.log(`[${workerName}] received [${msg.fields.routingKey}]:`, data);
            channel.ack(msg);
        }
    }, { noAck: false });
}

// Alag alag workers alag alag events sun rahe hain
startWorker('Order-Worker', 'orders.*');      // orders.create, orders.cancel
startWorker('Payment-Worker', 'payment.*');   // payment.done, payment.failed
startWorker('Support-Worker', 'support.*');   // support.ticket, support.reply
startWorker('All-Worker', '#');               // sabhi events