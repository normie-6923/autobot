const venom = require('venom-bot');
const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = 3001; // you can use any port

let qrBase64 = null; // 🟨 Store QR as base64 (you can also save as file)

// 📌 Trigger keywords
const TRIGGER_KEYWORDS = ['menu', 'order', 'discount', 'hi', 'hello', 'men', 'oder', 'manu'];
const PHONE_NUMBER = '📞 9876543210';
const ORDER_LINK = 'https://drive.google.com/file/d/1OAT0LQXqev9DBQ8Uz2U6uwchDazeMPdX/view?usp=drivesdk';

// 🔌 Start Express server
app.get('/qr/:clientId', (req, res) => {
  const { clientId } = req.params;

  // 🔐 Later you can validate user here
  if (!qrBase64) {
    return res.status(404).send('QR code not generated yet.');
  }

  res.send(`
    <html>
      <body style="text-align:center;">
        <h2>QR for Client: ${clientId}</h2>
        <img src="${qrBase64}" />
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🌐 QR server running at http://localhost:${PORT}`);
});

// 🔥 Start Venom Bot
venom
.create({
  session: 'bot-session1',
  headless: 'new',
  useChrome: false,
  autoClose: false,
  disableSpins: true,
  disableWelcome: true,
  browserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ],
  executablePath: '/root/.cache/puppeteer/chrome/linux-121.0.6167.85/chrome-linux64/chrome'
})


  .then((client) => start(client))
  .catch((err) => {
    console.error('❌ Failed to start bot:', err);
  });

function start(client) {
  console.log('✅ Bot is running...');

  client.onMessage(async (message) => {
    const lowerText = message.body?.toLowerCase() || '';
    const triggered = TRIGGER_KEYWORDS.some((kw) => lowerText.includes(kw));

if (triggered) {
  try {
    const imagePath = path.join(__dirname, 'assets', 'menu.jpg');
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Image not found at:', imagePath);
      return;
    }

    // ✅ Start typing indicator
    await client.startTyping(message.from);
    await client.sendText(message.from, '🕐 Preparing your menu, just a sec...');

    // ⏳ Send actual menu after a short delay
    setTimeout(async () => {
      try {
        await client.sendImage(
          message.from,
          imagePath,
          'menu.jpg',
          `Here’s our delicious menu! 🍔\nOrder here: ${ORDER_LINK}\n\nDon't forget to send Address after order 😊`
        );
        console.log(`📤 Sent menu to: ${message.from}`);
      } catch (err) {
        console.error('❌ Could not send image:', err.message || err);
      } finally {
        await client.stopTyping(message.from); // ✅ Stop typing indicator
      }
    }, 1000);
  } catch (err) {
    console.error('❌ Error in menu logic:', err.message || err);
  }
}


  });
}
