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
  return res.status(200).json({ invoiceLink: data.result });
}
