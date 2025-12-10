
import { GoogleGenAI } from "@google/genai";
import { PlantState, Habit } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getPlantMessage = async (
  plant: PlantState,
  habits: Habit[],
  userName: string
): Promise<string> => {
  const client = getClient();
  if (!client) return "Remember to drink water and track your habits!";

  const completedToday = habits.filter(h => {
    // Use local time for completion check
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return h.completedDates.includes(today);
  }).length;

  const totalHabits = habits.length;

  const prompt = `
    You are a magical, friendly digital plant named "Bloom".
    The user's name is ${userName || 'Friend'}.
    
    Current Status:
    - Stage: ${plant.stage}
    - Health: ${plant.health}
    - Habits Completed Today: ${completedToday}/${totalHabits}
    
    Task: Write a very short, cute, and encouraging message (max 20 words) from the plant's perspective to the user.
    
    If health is WITHERED or DEAD, sound sad but hopeful for water (habits).
    If health is WILTING, sound thirsty.
    If health is THRIVING, sound happy and energetic.
    If they completed all habits, celebrate!
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm ready to grow with you today!";
  }
};

export const estimateMetric = async (description: string, unit: string): Promise<number | null> => {
  const client = getClient();
  if (!client) return null;

  const prompt = `
    You are a nutrition and unit conversion assistant.
    User input: "${description}"
    Target Unit: "${unit}"

    Task: Estimate the numeric value for the user's input in the requested unit.
    For example, if input is "2 eggs" and unit is "kcal", return approx calories (e.g. 140).
    If input is "10 mins running" and unit is "kcal", return approx calories burned.
    
    Return ONLY the number (integer). Do not add text. If impossible to estimate, return 0.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const num = parseInt(response.text.replace(/[^0-9]/g, ''));
    return isNaN(num) ? null : num;
  } catch (error) {
    console.error("Gemini Estimation Error:", error);
    return null;
  }
};

export const analyzeImage = async (base64Image: string): Promise<{name: string, calories: number} | null> => {
  const client = getClient();
  if (!client) return null;

  // We use gemini-2.5-flash for multimodal inputs (image + text)
  const prompt = `
    Analyze this image of food.
    Identify the main dish or items.
    Estimate the total calories for the portion shown.

    Return the response in this specific JSON format:
    {
      "name": "Short description of food",
      "calories": 000
    }
    Only return JSON.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: prompt }
        ]
      },
    });
    
    const text = response.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return null;
  }
};