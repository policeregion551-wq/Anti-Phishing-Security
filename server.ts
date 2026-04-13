import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

// Twilio Client Initialization
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // API Route for Admin Withdrawal
  app.post("/api/withdraw", async (req, res) => {
    const { amount, phone, userId } = req.body;
    console.log(`Withdrawal request: ${amount} ETB to ${phone} for user ${userId}`);
    res.json({ status: "success", message: "Withdrawal request received and processing." });
  });

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
        subject: "BINI SHIELD AI Security - Verification Code",
        text: `Hello ${name || 'User'},\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nBINI SHIELD AI Security Team`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #2563eb; margin-bottom: 16px;">BINI SHIELD AI Security</h2>
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

    // Check if Twilio is configured
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn("Twilio is not configured. Logging OTP to console instead.");
      console.log(`[MOCK SMS] To: ${phone}, Code: ${code}`);
      return res.json({ 
        success: true, 
        message: "Twilio not configured. OTP logged to server console.",
        isMock: true 
      });
    }

    try {
      await twilioClient.messages.create({
        body: `Your BINI SHIELD AI verification code is: ${code}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to send SMS:", error);
      res.status(500).json({ error: "Failed to send verification SMS" });
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
