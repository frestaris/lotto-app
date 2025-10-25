import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWinEmail(
  to: string,
  gameName: string,
  amountCents: number
) {
  const amount = (amountCents / 100).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
  });

  await resend.emails.send({
    from: "Lotto App <noreply@resend.dev>",
    to,
    subject: `🎉 You won ${amount} in ${gameName}!`,
    html: `
      <div style="font-family:Arial;padding:20px;">
        <h2>🎉 Congratulations!</h2>
        <p>You’ve just won <b>${amount}</b> in ${gameName}!</p>
        <p>Your winnings have been added to your wallet.</p>
      </div>
    `,
  });
}
