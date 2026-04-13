import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const genAI = process.env.GEMINI_API_KEY ? new (GoogleGenAI as any)(process.env.GEMINI_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to send OTP
  app.post("/api/send-otp", async (req, res) => {
    const { email, code, name } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP is not configured. Logging OTP to console instead.");
      console.log(`[MOCK EMAIL] To: ${email}, Code: ${code}`);
      return res.json({ 
        success: true, 
        message: "SMTP not configured. OTP logged to server console.",
        isMock: true 
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: "ShieldAI Security - Verification Code",
        text: `Hello ${name || 'User'},\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nShieldAI Security Team`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #2563eb; margin-bottom: 16px;">ShieldAI Security</h2>
            <p>Hello ${name || 'User'},</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${code}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">By Asst. Eng. Biniyam Yirsaw Metina</p>
          </div>
        `,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).json({ error: "Failed to send verification email" });
    }
  });

  // API Route to send Phone OTP
  app.post("/api/send-phone-otp", async (req, res) => {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: "Phone and code are required" });
    }

    // Mock SMS sending - In real app, use Twilio, Infobip, etc.
    console.log(`[MOCK SMS] To: ${phone}, Code: ${code}`);
    res.json({ 
      success: true, 
      message: "Phone OTP sent (Mocked). Check server console.",
      isMock: true 
    });
  });

  // API Route for Security Audit
  app.post("/api/audit", async (req, res) => {
    const { target, type } = req.body;

    if (!target) {
      return res.status(400).json({ error: "Target is required" });
    }

    if (!genAI) {
      return res.status(500).json({ error: "Gemini AI is not configured" });
    }

    try {
      const model = (genAI as any).getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
        systemInstruction: `You are a senior security auditor. Analyze the provided ${type} (URL or Code) for vulnerabilities. 
          Return a JSON object with: 
          - status: 'pass' | 'fail' | 'warning'
          - score: number (0-100)
          - findings: array of { severity: 'critical'|'high'|'medium'|'low', issue: string, fix: string }
          - summary: string`
      });

      const result = await model.generateContent(`Audit this ${type}: "${target}"`);
      const response = await result.response;
      res.json(JSON.parse(response.text()));
    } catch (error) {
      console.error("Audit failed:", error);
      res.status(500).json({ error: "Security audit failed" });
    }
  });

  // API Route for Gemini Analysis
  app.post("/api/analyze", async (req, res) => {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    if (!genAI) {
      return res.status(500).json({ error: "Gemini AI is not configured on the server" });
    }

    try {
      const model = (genAI as any).getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
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
        },
        systemInstruction: "You are a cybersecurity expert. Analyze the content for phishing, malware, or scams. Return JSON."
      });

      const result = await model.generateContent(`Analyze this: "${content}"`);
      const response = await result.response;
      res.json(JSON.parse(response.text()));
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      res.status(500).json({ error: "AI Analysis failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
