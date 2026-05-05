import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = process.env.WAITLIST_NOTIFY_EMAIL || "hello@velaprotocol.xyz";
const FROM_EMAIL = process.env.WAITLIST_FROM_EMAIL || "waitlist@velaprotocol.xyz";

const depositLabels: Record<string, string> = {
  "50-500": "$50 – $500",
  "500-5000": "$500 – $5,000",
  "5000-50000": "$5,000 – $50,000",
  "50000+": "$50,000+",
};

const investorLabels: Record<string, string> = {
  individual: "Individual",
  hnw: "Family Office / HNW",
  institution: "Institution / Fund",
};

export async function POST(req: NextRequest) {
  try {
    const { email, deposit, investorType } = await req.json();

    // Basic validation
    if (!email || !deposit || !investorType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Send notification email via Resend
    if (RESEND_API_KEY) {
      const body = {
        from: `Vela Waitlist <${FROM_EMAIL}>`,
        to: [NOTIFY_EMAIL],
        subject: `New waitlist signup: ${email}`,
        html: `
          <div style="font-family: monospace; background: #08090f; color: #fff; padding: 32px; border-radius: 12px;">
            <h2 style="color: #00C2FF; margin: 0 0 24px;">New Vela Waitlist Signup</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 12px 0; color: #8B9BB4; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
                <td style="padding: 12px 0; color: #fff;">${email}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 12px 0; color: #8B9BB4; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Planned deposit</td>
                <td style="padding: 12px 0; color: #00C2FF; font-weight: bold;">${depositLabels[deposit] || deposit}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #8B9BB4; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Investor type</td>
                <td style="padding: 12px 0; color: #fff;">${investorLabels[investorType] || investorType}</td>
              </tr>
            </table>
            <p style="color: #8B9BB4; font-size: 11px; margin-top: 32px;">Submitted via vela-protocol.vercel.app</p>
          </div>
        `,
      };

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!resendRes.ok) {
        const err = await resendRes.json();
        console.error("Resend error:", err);
        // Don't fail the user-facing request if email fails — log it and continue
      }
    } else {
      // No Resend key — log to console (useful in dev / before env var is set)
      console.log("[WAITLIST SIGNUP]", { email, deposit, investorType });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
