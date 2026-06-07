export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  const update = req.body;

  // ─── pre_checkout_query ───────────────────────────────────────
  // Telegram требует ответ в течение 10 секунд!
  // Без этого кнопка оплаты крутится вечно.
  if (update.pre_checkout_query) {
    const query = update.pre_checkout_query;
    console.log('[webhook] pre_checkout_query:', query.id, query.invoice_payload);

    await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerPreCheckoutQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pre_checkout_query_id: query.id,
          ok: true
        })
      }
    );

    return res.status(200).json({ ok: true });
  }

  // ─── successful_payment ───────────────────────────────────────
  // Вызывается когда оплата прошла успешно
  if (update.message && update.message.successful_payment) {
    const payment = update.message.successful_payment;
    const telegramId = String(update.message.from.id);
    const payload = payment.invoice_payload;

    console.log('[webhook] successful_payment:', telegramId, payload, payment.telegram_payment_charge_id);

    // Здесь сохраняй покупку в Supabase
    // payload = "deck_1", "deck_2", "tarot_cover" и т.д.

    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
