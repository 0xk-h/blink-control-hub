import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VoiceMessageRequest {
  to_email: string;
  message: string;
  time: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to_email, message, time }: VoiceMessageRequest = await req.json();

    console.log(`Sending voice message email to: ${to_email} at ${time}`);

    if (!to_email || !to_email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "No message provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "BlinkControl Voice Message <onboarding@resend.dev>",
      to: [to_email],
      subject: "🎤 Voice Message from BlinkControl",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 40px; border-radius: 16px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">🎤 Voice Message</h1>
            <p style="color: #c4b5fd; margin: 10px 0 0 0; font-size: 16px;">BlinkControl Speech-to-Text</p>
          </div>
          
          <div style="background: #f5f3ff; padding: 30px; border-radius: 16px; margin-top: 20px; border: 3px solid #8b5cf6;">
            <h2 style="color: #6d28d9; font-size: 20px; margin: 0 0 20px 0; text-align: center;">
              📝 Transcribed Message
            </h2>
            
            <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #8b5cf6;">
              <p style="color: #1f2937; margin: 0; font-size: 18px; line-height: 1.8; font-style: italic;">
                "${message}"
              </p>
            </div>
            
            <div style="background: #ede9fe; padding: 15px; border-radius: 12px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; color: #5b21b6; font-weight: bold; font-size: 14px;">Recorded At:</td>
                  <td style="padding: 8px; color: #7c3aed; font-size: 14px;">${time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; color: #5b21b6; font-weight: bold; font-size: 14px;">Triggered By:</td>
                  <td style="padding: 8px; color: #7c3aed; font-size: 14px;">6 Consecutive Blinks</td>
                </tr>
              </table>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This voice message was recorded and transcribed using BlinkControl's<br>
              speech-to-text feature, triggered by 6 consecutive blinks.
            </p>
            <p style="color: #9ca3af; font-size: 11px; margin-top: 10px;">
              © 2026 BlinkControl - Eye Blink-Based Appliance Control System
            </p>
          </div>
        </div>
      `,
    });

    console.log("Voice message email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending voice message email:", error);
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
