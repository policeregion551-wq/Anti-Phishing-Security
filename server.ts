import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

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
