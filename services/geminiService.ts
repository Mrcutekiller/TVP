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
    // Robust API Key Retrieval for Vercel/Vite/React environments
    let apiKey = '';

    // 1. Try standard process.env (Node/Webpack/Some Vite configs)
    // We check typeof process to avoid ReferenceErrors in strict browser environments
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }

    // 2. Try Vite's import.meta.env (Standard Vite)
    // We cast to 'any' to avoid TypeScript errors if types aren't explicitly configured
    if (!apiKey) {
      try {
        const meta = import.meta as any;
        if (meta && meta.env) {
          apiKey = meta.env.VITE_API_KEY || meta.env.API_KEY;
        }
      } catch (e) {
        // Ignore errors if import.meta is not available
      }
    }

    // 3. Throw explicit error if still missing
    if (!apiKey) {
      throw new Error("Configuration Error: API Key is missing. If you are on Vercel, please add 'VITE_API_KEY' to your Environment Variables.");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
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
                mimeType: "image/png", 
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
    
    return {
      pair: "ERROR",
      timeframe: "N/A",
      direction: "N/A",
      strategy: "System Error",
      entry: 0,
      sl: 0,
      tp1: 0,
      tp2: 0,
      reasoning: error.message || "Unknown error occurred during analysis.",
      isSetupValid: false,
      marketStructure: []
    };
  }
};