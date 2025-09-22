const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal'); // prints QR in terminal
const QRCode = require('qrcode');                 // writes PNG file
const path = require('path');
const fs = require('fs');

const TRIGGER_KEYWORDS = ['menu', 'order', 'meenu', 'oder', 'manu', 'meno', 'odar'];
const ORDER_LINK = 'catalogue link';

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-session2" }),
  puppeteer: {
    headless: true,
    executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
  },
});

// QR: print to terminal AND save as PNG
client.on('qr', (qr) => {
  console.log('📲 Scan this QR to log in:');

  try {
    qrcodeTerminal.generate(qr, { small: true });
  } catch (err) {
    console.error('❌ qrcode-terminal failed:', err);
  }

  try {
    const qrImagePath = path.join('/app/shared_qr', 'bot-session4.png');
    fs.mkdirSync(path.dirname(qrImagePath), { recursive: true });
    QRCode.toFile(qrImagePath, qr)
      .then(() => console.log(`✅ QR code saved at: ${qrImagePath}`))
      .catch((err) => console.error('❌ Failed to save QR PNG:', err));
  } catch (err) {
    console.error('❌ Could not create shared_qr folder:', err);
  }
});

client.on('authenticated', () => console.log('🔐 Authenticated'));
client.on('auth_failure', (msg) => console.error('❌ Auth failure:', msg));
client.on('ready', () => console.log('✅ Bot is running...'));
client.on('disconnected', (reason) => console.log('⚠️ Disconnected:', reason));

client.on('message', async (msg) => {
  // 🚫 Ignore group messages
  if (msg.from.endsWith('@g.us')) {
    console.log(`🚫 Ignored group message from: ${msg.from}`);
    return;
  }

  // Only react to text messages
  if (msg.type !== 'chat') return;

  const lowerText = msg.body?.toLowerCase() || '';
  const triggered = TRIGGER_KEYWORDS.some((kw) => lowerText.includes(kw));
  console.log(`📩 Received message: "${msg.body}" from ${msg.from}`);

  if (!triggered) return;

  try {
    const imagePath = path.join(__dirname, 'assets', 'menu.png');
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Image not found at:', imagePath);
      return;
    }


await client.sendMessage(msg.from,"preparing your menu 🕑")
    setTimeout(async () => {
      try {
        const media = MessageMedia.fromFilePath(imagePath);
        await client.sendMessage(msg.from, media, {
          caption: `Here’s our delicious menu! 🍔\nOrder here: ${ORDER_LINK}\n\nPlease 📞 call once for confirming your order\n`
        });
        console.log(`📤 Sent menu to: ${msg.from}`);
      } catch (err) {
        console.error('❌ Could not send image:', err);
      }
    }, 1000);
  } catch (err) {
    console.error('❌ Error in menu logic:', err);
  }
});

client.initialize();