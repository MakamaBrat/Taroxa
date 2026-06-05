export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(404).json({ error: "Not found" });

  const { title, description, payload, stars } = req.body || {};

  const amount = parseInt(stars, 10);
  if (!amount || amount < 1) {
    return res.status(400).json({ error: "stars должен быть положительным целым числом" });
  }

  if (!process.env.BOT_TOKEN) {
    // Частая причина пустой ссылки: на ЭТОМ деплое нет переменной BOT_TOKEN
    return res.status(500).json({ error: "BOT_TOKEN не задан на этом деплое Vercel" });
  }

  try {
    const tg = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/createInvoiceLink`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Покупка",
          description: description || "Внутриигровой товар",
          payload: payload || "item",
          provider_token: "",      // для оплаты звёздами (XTR) токен провайдера пустой
          currency: "XTR",
          prices: [{ label: title || "Товар", amount }]
        })
      }
    );

    const data = await tg.json();

    // ★ Раньше код возвращал 200 даже при ошибке Telegram → в игру прилетала пустая ссылка
    if (!data.ok || !data.result) {
      console.error("createInvoiceLink failed:", data);
      return res.status(502).json({ error: data.description || "Telegram error", telegram: data });
    }

    return res.status(200).json({ invoiceLink: data.result });
  } catch (e) {
    console.error("create-invoice exception:", e);
    return res.status(500).json({ error: e.message });
  }
}
