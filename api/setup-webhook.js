export default async function handler(req, res) {
  try {
    const webhookUrl = "https://taroxa.vercel.app/api/webhook";

    console.log("🔧 Setting webhook to:", webhookUrl);

    const response = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "pre_checkout_query"]
        })
      }
    );

    const data = await response.json();
    
    console.log("✅ Webhook setup response:", JSON.stringify(data, null, 2));

    return res.status(200).json({
      message: "Webhook setup",
      data: data,
      webhookUrl: webhookUrl
    });
  } catch (error) {
    console.error("❌ Setup webhook error:", error);
    return res.status(500).json({ error: error.message });
  }
}
