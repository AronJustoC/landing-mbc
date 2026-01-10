export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();
    const { nombre, email, empresa, telefono, mensaje, recaptcha } = data;

    if (!recaptcha) {
        return new Response(JSON.stringify({ message: "Falta el token de reCAPTCHA" }), { status: 400 });
    }

    // Verify with Google
    const secretKey = import.meta.env.RECAPTCHA_SECRET_KEY || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFyjTsGk5FNQS"; // Fallback to test key if env not set

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptcha}`;

    try {
        const response = await fetch(verifyUrl, { method: "POST" });
        const googleData = await response.json();

        if (!googleData.success) {
            return new Response(JSON.stringify({ message: "Verificación de reCAPTCHA fallida" }), { status: 400 });
        }

        // Here you would normally send the email using a service like Resend, SendGrid, etc.
        // For now, we'll confirm success.

        // Simulate email sending delay
        // await new Promise(r => setTimeout(r, 500));

        return new Response(
            JSON.stringify({
                message: "¡Mensaje recibido correctamente!",
            }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(JSON.stringify({ message: "Error del servidor" }), { status: 500 });
    }
};
