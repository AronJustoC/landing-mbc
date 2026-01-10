export const prerender = false;

import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();
    const { nombre, email, empresa, telefono, mensaje, recaptcha } = data;

    if (!recaptcha) {
        return new Response(JSON.stringify({ message: "Falta el token de reCAPTCHA" }), { status: 400 });
    }

    // 1. Verify reCAPTCHA with Google
    const secretKey = import.meta.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptcha}`;

    try {
        const recaptchaRes = await fetch(verifyUrl, { method: "POST" });
        const googleData = await recaptchaRes.json();

        if (!googleData.success) {
            console.error("reCAPTCHA Failed:", googleData);
            return new Response(JSON.stringify({ message: "Verificación de reCAPTCHA fallida" }), { status: 400 });
        }

        // 2. Configure SMTP Transporter (Namecheap / PrivateEmail)
        const transporter = nodemailer.createTransport({
            host: import.meta.env.SMTP_HOST || "mail.privateemail.com",
            port: Number(import.meta.env.SMTP_PORT) || 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: import.meta.env.SMTP_USER, // info@mbcpredictive.com
                pass: import.meta.env.SMTP_PASS,
            },
        });

        // 3. Prepare Email Content
        const mailOptions = {
            from: `"Web MBC Contact" <${import.meta.env.SMTP_USER}>`, // Sender address (Must be the one authenticated)
            to: "info@mbcpredictive.com", // Receiver address
            replyTo: email, // If you click reply, it goes to the user
            subject: `Nuevo Mensaje Web de: ${nombre}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #31B0FF;">Nuevo Contacto desde la Web</h2>
                    <p>Has recibido un nuevo mensaje a través del formulario de contacto.</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Nombre:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${nombre}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Empresa:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${empresa || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Teléfono:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${telefono}</td>
                        </tr>
                    </table>

                    <div style="margin-top: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
                        <strong>Mensaje:</strong><br/>
                        <p style="white-space: pre-wrap;">${mensaje}</p>
                    </div>
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #888;">Este correo fue enviado automáticamente desde mbcpredictive.com</p>
                </div>
            `,
        };

        // 4. Send Email
        await transporter.sendMail(mailOptions);

        return new Response(
            JSON.stringify({
                message: "¡Mensaje enviado y recibido correctamente!",
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Server Error:", error);
        return new Response(
            JSON.stringify({ message: "Error enviando el correo. Intenta más tarde." }),
            { status: 500 }
        );
    }
};
