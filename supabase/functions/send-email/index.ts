
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { VerificationEmail } from "./_templates/verification.tsx";
import { MagicLinkEmail } from "./_templates/magic-link.tsx";
import { ResetPasswordEmail } from "./_templates/reset-password.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "verification" | "magic-link" | "reset-password";
  email: string;
  url: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, url }: EmailRequest = await req.json();

    let subject: string;
    let html: string;

    switch (type) {
      case "verification":
        subject = "Verify your email for Empire's Legacy";
        html = await renderAsync(VerificationEmail({ confirmationUrl: url, email }));
        break;
      case "magic-link":
        subject = "Your login link for Empire's Legacy";
        html = await renderAsync(MagicLinkEmail({ magicLink: url, email }));
        break;
      case "reset-password":
        subject = "Reset your password for Empire's Legacy";
        html = await renderAsync(ResetPasswordEmail({ resetLink: url, email }));
        break;
      default:
        throw new Error("Invalid email type");
    }

    const emailResponse = await resend.emails.send({
      from: "Empire's Legacy <no-reply@empireslegacy.com>",
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
