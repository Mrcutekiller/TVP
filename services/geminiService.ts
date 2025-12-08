import { GoogleGenAI } from "@google/genai";
import { AIAnalysisResponse } from "../types";

const SYSTEM_PROMPT = `
You are an expert Forex and Crypto technical analyst.
Your job is to analyze trading charts provided as images and extract a valid trade setup.

**INSTRUCTIONS:**
1. Identify the main trend or pattern (e.g., Uptrend, Downtrend, Range, Breakout).
2. Look for any ICT concepts if present (Order Blocks, FVG, Liquidity), but standard Price Action (Support/Resistance) is also acceptable.
3. Determine a logical Entry, Stop Loss (SL), and Take Profit (TP) levels based on the visual data.

**CRITICAL OVERRIDE RULES:**
- **ALWAYS return a valid JSON response**, even if the chart is unclear, zoomed in, or messy. 
- **Infer** the pair and timeframe if they are not explicitly visible.
- **NEVER** return "isSetupValid": false unless the image is clearly NOT a chart (e.g., a selfie, a cat, a blank screen).
- If the image contains candlesticks or price lines, **YOU MUST GENERATE A SIGNAL**.
- **TIGHT STOP LOSS**: Place SL at the nearest invalidation point. Do not use wide stops.
- **RISK TO REWARD**: Aim for 1:2 RR minimum.

You MUST return the response in strict JSON format.
The JSON schema is:
{
  "pair": "string (e.g. XAUUSD, BTCUSD - infer if missing)",
  "timeframe": "string (e.g. 15m, 1h - default to 'Current')",
  "direction": "BUY" or "SELL",
  "strategy": "string (e.g. 'Order Block', 'Trend Follow', 'Breakout')",
  "entry": number,
  "sl": number,
  "tp1": number,
  "tp2": number,
  "reasoning": "string (Concise explanation of the setup)",
  "isSetupValid": boolean,
  "marketStructure": ["string", "string"]
}
`;

export const analyzeChartWithGemini = async (base64Image: string): Promise<AIAnalysisResponse> => {
  try {
    // Check for API Key presence to provide a clear error if missing
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please check your app settings/environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using flash for speed and vision capabilities
    const modelId = "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inlineData: {
                mimeType: "image/png", // Assuming PNG, but API handles common types
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response received from AI Model.");

    let data: AIAnalysisResponse;
    try {
        data = JSON.parse(text) as AIAnalysisResponse;
    } catch (e) {
        throw new Error("Failed to parse AI response. Raw text: " + text.substring(0, 50) + "...");
    }

    // Ensure marketStructure is always an array
    if (!data.marketStructure) data.marketStructure = [];
    
    // Fallback if strategy is missing
    if (!data.strategy) data.strategy = "Price Action";

    return data;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Return the specific error message to the UI for debugging
    return {
      pair: "ERROR",
      timeframe: "N/A",
      direction: "N/A",
      strategy: "System Error",
      entry: 0,
      sl: 0,
      tp1: 0,
      tp2: 0,
      // Pass the actual error message to the user
      reasoning: error.message || "Unknown error occurred during analysis.",
      isSetupValid: false,
      marketStructure: []
    };
  }
};