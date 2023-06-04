const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config()

// Initializes your app with your bot token, signing secret, and app-level token
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 8000
});

// Reaction added event handler
app.event('reaction_added', async ({ event, client }) => {
    const { item, reaction, item_user } = event;

    // Send a message if reaction added is :question:
    if(reaction === 'question') {
        // Call analyze-message endpoint of the backend server with message contents as a JSON payload
        try {
            // Fetch the thread's messages using client's conversations.replies method
            const result = await client.conversations.replies({
                channel: item.channel,
                ts: item.ts,
            });

            const messages = result.messages;

            // Find the current message in the thread
            const currentMessage = messages.find(message => message.user === item_user && message.ts === item.ts);

            if(currentMessage) {
                const messageText = currentMessage.text;

                const response = await axios.post('http://localhost:3000/analyze-message', {message: messageText,}, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                // Prepare the message parameters
                const messageParams = {
                    channel: event.item.channel,
                    text: response.data.response,
                };
                
                console.log('Response from analyze-message endpoint', response.data);
                
                // Determine if the item is already a thread. The existence of a thread timestamp (thread_ts) determines if a message is a Threaded message
                const isThread = item.thread_ts !== undefined;
                
                // If it's a thread, post the message in the same thread
                if (isThread) {
                    messageParams.thread_ts = item.thread_ts;
                } else {
                    // Start a new thread by replying to the original message
                    messageParams.thread_ts = item.ts;
                }
                
                await client.chat.postMessage(messageParams);
            } else {
                console.error('Current message not found in the thread');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
});

(async () => {
    // Start app
    await app.start();

    console.log('⚡️ Bolt app is running!');
})();