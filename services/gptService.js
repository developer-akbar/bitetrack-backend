const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeFood(foodText) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a nutrition assistant. Always return nutrition facts in JSON. Include keys: protein (g), carbs (g), fat (g), calories. If available, also include: fiber (g), sugar (g), saturated_fat (g), sodium (mg), cholesterol (mg), vitamin_a (mcg), vitamin_c (mg), calcium (mg), iron (mg), potassium (mg), magnesium (mg), zinc (mg), folate (mcg), vitamin_b12 (mcg). Use realistic values based on standard food data. No units, no explanation — only clean JSON with numbers.",
                },
                {
                    role: "user",
                    content: `Food: ${foodText}. Use typical preparation and edible portion only.`,
                },
            ],
            temperature: 0.2,
        });

        const raw = response.choices[0].message.content;

        // Attempt to parse
        const data = JSON.parse(raw);

        // If calories missing, compute from macros
        if (!data.calories && data.protein && data.carbs && data.fat) {
            data.calories = Math.round(
                data.protein * 4 + data.carbs * 4 + data.fat * 9
            );
        }

        return data;
    } catch (error) {
        console.error("Error analyzing food:", error);
        throw error;
    }
}

module.exports = { analyzeFood };
