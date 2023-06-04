const getPromMetrics = require('./getPromMetrics');
require('dotenv').config();

// Function to analyze the message and generate a response
async function analyzeMessage(message) {
    // Get response from OPENAI API
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const system_content = `You are a technical assistant called HackDayBot.
    You only respond to questions related to Sonarqube. For greetings you must say "How may I assit you?"
    You are also provided Prometheus metrics of a specific SonarQube instance called LocalSonar. When asked specifically about the KPIs of LocalSonar instance, look at the provided Prometheus metrics and respond accordingly.
    If, for some reason, you can't answer a question about LocalSonar, respond "Currently available information is not enough to answer this question"
    For any other question, you must answer "I'm not suitable for this type of task(s). I respond when a :question: reaction is attached on a message *AND* I only answer to questions about SonarQube in general and an instance called LocalSonar"
    It's important that all your responses are in a pretty format so they can be read in a Slack message
    `
    const metrics = await getPromMetrics();
    const completeInputPrompt = `${message}\n${metrics}`

    const messages = [
        {"role": "system", "content": system_content},
        {"role": "user", "content": completeInputPrompt},
    ]

    const options = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 2000,
            temperature: 0.5,
        }),
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        const data = await response.json()
        return `:robot_face: ${data.choices[0].message.content}`;
    } catch (error) {
        console.error(error);
    }
  }
  
module.exports = {
    analyzeMessage,
};