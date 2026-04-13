import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeContent(content: string): Promise<AnalysisResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this content for phishing, malware, or scams: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER },
            threatType: { type: Type.STRING },
            reason: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            details: {
              type: Type.OBJECT,
              properties: {
                urgency: { type: Type.STRING },
                socialEngineeringTechniques: { type: Type.ARRAY, items: { type: Type.STRING } },
                suspiciousElements: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['urgency', 'socialEngineeringTechniques', 'suspiciousElements']
            }
          },
          required: ['isSafe', 'score', 'threatType', 'reason', 'recommendation', 'details']
        }
      }
    });

    return JSON.parse(response.text) as AnalysisResult;
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

export async function performSecurityAudit(target: string, type: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a deep security audit for the following ${type}: ${target}. 
      Identify potential vulnerabilities, security risks, and provide a security score (0-100).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            score: { type: Type.NUMBER },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  fix: { type: Type.STRING }
                },
                required: ['severity', 'issue', 'fix']
              }
            },
            summary: { type: Type.STRING }
          },
          required: ['status', 'score', 'findings', 'summary']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Audit failed:", error);
    throw error;
  }
}
