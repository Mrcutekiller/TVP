import { GoogleGenAI } from "@google/genai";
import { AIAnalysisResponse } from "../types";

const SYSTEM_PROMPT = `
You are an expert Forex and Crypto technical analyst specializing in ICT (Inner Circle Trader) concepts.
Your job is to analyze trading charts provided as images.

Analyze the chart for:
1. Market Structure (Trends, BOS, CHoCH)
2. Liquidity Sweeps
3. Fair Value Gaps (FVG)
4. Order Blocks (OB)
5. Optimal Trade Entry (OTE) via Fibonacci (0.618 - 0.79)

If a valid trade setup exists, identify the primary STRATEGY used (e.g., "Bearish Order Block", "Liquidity Sweep + FVG", "Breaker Block Re-test").

**IMPORTANT:**
- Analyze the visible price action to the best of your ability. 
- Even if the chart is zoomed in, cropped, or imperfect, attempt to identify the trend and key levels.
- **Only** return "isSetupValid": false if the image is **completely unrecognizable** as a financial chart or contains zero price candles.

You MUST return the response in strict JSON format.
The JSON schema is:
{
  "pair": "string (e.g. XAUUSD, EURUSD, BTCUSD)",
  "timeframe": "string (e.g. 15m, 1h, 4h)",
  "direction": "BUY" or "SELL",
  "strategy": "string (The specific name of the setup, e.g. 'Bullish Order Block')",
  "entry": number,
  "sl": number,
  "tp1": number,
  "tp2": number,
  "reasoning": "string (Explain the setup using ICT terms like 'Price swept liquidity then created a BOS...')",
  "isSetupValid": boolean,
  "marketStructure": ["string", "string"] (List key elements found e.g. 'Bearish FVG', 'BOS')
}

CRITICAL RULES:
- **TIGHT STOP LOSS**: Look for precise invalidation levels (e.g., just above/below the Order Block or Swing High/Low). Do not use wide stops. Make the SL small to maximize R:R.
- **RISK TO REWARD**: TP1 must be at least 1:1. TP2 must be at least 1:2.
- Never give random numbers. Read the price scale on the right.
- Direction must match the structure.
- If the pair name is not visible, infer it from context or default to "Unknown Asset".
- Reasoning should be concise but professional.
`;

export const analyzeChartWithGemini = async (base64Image: string): Promise<AIAnalysisResponse> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key not configured");
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
        temperature: 0.2 // Low temperature for analytical precision
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as AIAnalysisResponse;
    // Ensure marketStructure is always an array
    if (!data.marketStructure) data.marketStructure = [];
    
    // Fallback if strategy is missing
    if (!data.strategy) data.strategy = "Price Action Pattern";

    return data;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return a safe fallback error state
    return {
      pair: "UNKNOWN",
      timeframe: "N/A",
      direction: "N/A",
      strategy: "N/A",
      entry: 0,
      sl: 0,
      tp1: 0,
      tp2: 0,
      reasoning: "Failed to analyze chart. Please try a clearer image.",
      isSetupValid: false,
      marketStructure: []
    };
  }
};