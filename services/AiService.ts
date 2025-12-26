
import { GoogleGenAI } from "@google/genai";

export const generatePerformanceInsight = async (employeeData: any) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined') {
    console.error("Gemini API Key is missing from environment variables.");
    return "ERROR: API Configuration Missing. Please ensure API_KEY is set in your deployment environment.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are a senior HR consultant for an international airport ground handling company.
    Analyze the following employee data and provide:
    1. A 2-sentence executive summary of their performance.
    2. One specific area for improvement based on their observations/notes.
    3. A predicted "Retention Risk" level (Low, Medium, High).

    DATA:
    ${JSON.stringify(employeeData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    if (!response || !response.text) {
      throw new Error("Empty response from Gemini API");
    }

    return response.text;
  } catch (error: any) {
    console.error("AI Analysis failed:", error);
    
    if (error.message?.includes("401")) {
      return "ERROR: Invalid API Key. Please check your credentials.";
    }
    if (error.message?.includes("429")) {
      return "ERROR: Rate limit exceeded. Please try again in a minute.";
    }
    
    return `Analysis failed: ${error.message || "Unknown error occurred"}`;
  }
};
