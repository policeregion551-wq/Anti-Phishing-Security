import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeContent(content: string): Promise<AnalysisResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following message or URL for security threats (phishing, malware, scams, suspicious activity). 
      Content to analyze: "${content}"`,
      config: {
        systemInstruction: `You are a world-class cybersecurity expert specializing in phishing detection and social engineering analysis. 
        Your task is to evaluate messages, links, and snippets for potential threats.
        Be extremely cautious. If something looks even slightly like a scam (e.g., "urgent action required", "win a prize", "verify your account"), mark it as suspicious or phishing.
        Return the analysis in a strict JSON format.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER, description: "Safety score from 0 to 100" },
            threatType: { 
              type: Type.STRING, 
              enum: ['none', 'phishing', 'malware', 'scam', 'suspicious'] 
            },
            reason: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            details: {
              type: Type.OBJECT,
              properties: {
                urgency: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                socialEngineeringTechniques: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                },
                suspiciousElements: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                }
              },
              required: ['urgency', 'socialEngineeringTechniques', 'suspiciousElements']
            }
          },
          required: ['isSafe', 'score', 'threatType', 'reason', 'recommendation', 'details']
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      isSafe: false,
      score: 0,
      threatType: 'suspicious',
      reason: "Analysis failed due to a technical error. Treat this content as unsafe.",
      recommendation: "Do not click any links or provide personal information.",
      details: {
        urgency: 'high',
        socialEngineeringTechniques: [],
        suspiciousElements: ['Technical error during analysis']
      }
    };
  }
}
