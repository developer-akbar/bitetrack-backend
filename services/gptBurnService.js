const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeActivity(activityText) {
    const prompt = `You are a fitness assistant. Estimate calories burned for: ${activityText}. Return only JSON with this key: calories_burned.`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a fitness assistant. Return only raw JSON. No explanation, no markdown. Keys: calories, duration (in minutes)`
            },
            {
                role: "user",
                content: activityText
            }
        ],
        temperature: 0.4
    });


    // Remove ```json or ``` if present
    const json = JSON.parse(response.choices[0].message.content.trim().replace(/```json|```/g, '').trim());
    return json;
}

module.exports = { analyzeActivity };