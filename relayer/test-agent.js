const { generateText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
require('dotenv').config();

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

async function test() {
    try {
        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            system: 'You are a test agent.',
            prompt: 'Say hello world.',
            tools: {}
        });
        console.log('Success:', text);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
