import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in the Settings menu.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function analyzeContent(content: string): Promise<AnalysisResult> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: `Analyze this content for phishing, malware, or scams: "${content}"` }] }],
      config: {
        systemInstruction: "You are a cybersecurity expert. Analyze the provided content and return a JSON object indicating if it is safe, its threat score, threat type, reason, and recommendations.",
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

    if (!response.text) {
      console.error("AI returned an empty response. Full response:", response);
      throw new Error("AI returned an empty response");
    }

    try {
      // Remove potential markdown code blocks if the AI includes them
      const cleanText = response.text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanText) as AnalysisResult;
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", response.text);
      throw new Error("Invalid AI response format");
    }
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
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: `Perform a deep security audit for the following ${type}: ${target}. 
      Identify potential vulnerabilities, security risks, and provide a security score (0-100).` }] }],
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

export async function verifyReceipt(imageBase64: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64
              }
            },
            {
              text: `Extract the following information from this Telebirr receipt image:
              1. Transaction ID (usually starts with 'BINI' or a long alphanumeric string)
              2. Amount Paid (in ETB)
              3. Date of Transaction
              4. Is it a valid Telebirr receipt? (true/false)
              
              Return the data in JSON format.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transactionId: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            isValid: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ['transactionId', 'amount', 'date', 'isValid']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Receipt verification failed:", error);
    throw error;
  }
}
