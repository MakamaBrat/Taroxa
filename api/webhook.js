export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const update = req.body;

    console.log("📨 Telegram webhook received:", JSON.stringify(update, null, 2));

    // ============================================================
    // ОБРАБОТКА: pre_checkout_query (подтверждение платежа)
    // ============================================================
    if (update.pre_checkout_query) {
      const preCheckoutQueryId = update.pre_checkout_query.id;
      const userId = update.pre_checkout_query.from.id;
      const payload = update.pre_checkout_query.invoice_payload;

      console.log(`📋 Pre-checkout query от User ${userId}:`, payload);

      // Отвечаем Telegram что платёж можно проводить
      const answerResponse = await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerPreCheckoutQuery`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pre_checkout_query_id: preCheckoutQueryId,
            ok: true
          })
        }
      );

      const answerData = await answerResponse.json();
      console.log("✅ Pre-checkout query answered:", answerData);

      // Сразу отправляем 200 - важно!
      return res.status(200).json({ ok: true });
    }

    // ============================================================
    // ОБРАБОТКА: successful_payment (успешный платёж)
    // ============================================================
    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const userId = update.message.from.id;
      const username = update.message.from.username || "unknown";
      const payload = payment.invoice_payload;
      const currency = payment.currency; // обычно "XTR" (Telegram Stars)
      const totalAmount = payment.total_amount;

      console.log(`💰 ПЛАТЁЖ УСПЕШЕН!`);
      console.log(`  User ID: ${userId}`);
      console.log(`  Username: ${username}`);
      console.log(`  Payload: ${payload}`);
      console.log(`  Currency: ${currency}`);
      console.log(`  Amount: ${totalAmount}`);

      // 🔥 ВАЖНО: Сразу отправляем 200 OK без ожидания БД
      res.status(200).json({ ok: true });

      // Остальные операции в фоне (не блокируют ответ)
      // Здесь добавляешь звёзды пользователю в БД:
      // await addStarsToUser(userId, payload, totalAmount);
      // await notifyUser(userId, `Покупка успешна! Получено ${totalAmount} звёзд`);
      // await logPayment(userId, payload, totalAmount);

      return;
    }

    // Для всех остальных обновлений просто отвечаем OK
    console.log("📌 Other update type:", update.update_id);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    // ВАЖНО: Даже при ошибке отвечаем 200!
    // Иначе Telegram будет переотправлять это сообщение
    res.status(200).json({ ok: true, error: error.message });
  }
}
