export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(404).json({ error: "Not found" });
  }

  const { title, description, payload, stars } = req.body;

  console.log("📝 Creating invoice:", { title, payload, stars });

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/createInvoiceLink`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Покупка",
          description: description || "Внутриигровой товар",
          payload: payload || "item",
          currency: "XTR",
          prices: [{ label: title || "Товар", amount: stars }]
        })
      }
    );

    const data = await response.json();
    
    console.log("📋 Invoice creation response:", JSON.stringify(data, null, 2));

    if (!data.ok) {
      console.error("❌ Telegram API error:", data);
      return res.status(400).json({ 
        error: "Failed to create invoice", 
        details: data.description 
      });
    }

    if (!data.result) {
      console.error("❌ No invoice link in response:", data);
      return res.status(400).json({ error: "No invoice link received" });
    }

    console.log("✅ Invoice created successfully:", data.result);
    
    return res.status(200).json({ invoiceLink: data.result });
  } catch (error) {
    console.error("❌ Create invoice error:", error);
    return res.status(500).json({ error: error.message });
  }
}
