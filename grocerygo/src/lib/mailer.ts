import nodemailer from "nodemailer"

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const user = process.env.SMTP_USER || process.env.EMAIL;
const pass = process.env.SMTP_PASS || process.env.PASS;
const secure = process.env.SMTP_SECURE === "true";

const transporterConfig: any = host
  ? {
      host,
      port,
      secure,
      auth: { user, pass },
    }
  : {
      service: "gmail",
      auth: { user, pass },
    };

const transporter = nodemailer.createTransport(transporterConfig);

export const sendMail = async (to: string, subject: string, html: string) => {
    await transporter.sendMail({
        from: `"GroceryGo" <${user}>`,
        to,
        subject,
        html
    })
}