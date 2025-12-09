
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
- **TIGHT STOP LOSS**: Place SL at the nearest invalidation point (e.g., recent swing low/high). If timeframe is small (5m/15m), use SCALPING tight stops.
- **STRATEGY NAME**: You must populate the "strategy" field (e.g., "Bullish Order Block", "Liquidity Sweep", "Trendline Break").
- **RISK TO REWARD**: Aim for 1:2 RR minimum.

You MUST return the response in strict JSON format.
The JSON schema is:
{
  "pair": "string (e.g. XAUUSD, BTCUSD - infer if missing)",
  "timeframe": "string (e.g. 5m, 15m, 1h - default to 'Current')",
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
    let apiKey = '';

    // --- ROBUST API KEY DISCOVERY ---
    // 1. Vite / Vercel (Standard) - Using brackets to avoid some bundler replacements
    // @ts-ignore
    if (import.meta.env && import.meta.env['VITE_API_KEY']) {
      // @ts-ignore
      apiKey = import.meta.env['VITE_API_KEY'];
    }
    
    // 2. Vite (Direct Property Access)
    // @ts-ignore
    if (!apiKey && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      apiKey = import.meta.env.VITE_API_KEY;
    }

    // 3. Fallback: Generic API_KEY
    // @ts-ignore
    if (!apiKey && import.meta.env && import.meta.env.API_KEY) {
      // @ts-ignore
      apiKey = import.meta.env.API_KEY;
    }

    // 4. Next.js / React Style (Just in case)
    // @ts-ignore
    if (!apiKey && import.meta.env && import.meta.env.NEXT_PUBLIC_API_KEY) {
      // @ts-ignore
      apiKey = import.meta.env.NEXT_PUBLIC_API_KEY;
    }

    // 5. Node.js Process (Local dev / Webpack)
    if (!apiKey && typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY || process.env.VITE_API_KEY || '';
    }

    if (!apiKey) {
      throw new Error("Configuration Error: API Key is missing. Please add 'VITE_API_KEY' to your Vercel Environment Variables and REDEPLOY.");
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
        temperature: 0.2,
        // Lower tokens to force conciseness and speed
        maxOutputTokens: 1024
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
    if (!data.strategy || data.strategy === "") data.strategy = "Price Action";

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
