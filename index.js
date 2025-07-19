const venom = require('venom-bot');
const path = require('path');
const fs = require('fs');

// 📌 Trigger keywords
const TRIGGER_KEYWORDS = ['menu', 'order', 'discount'];

// 📞 Your business contact
const PHONE_NUMBER = '📞 9876543210';
const order = 'https://wa.me/c/919211255569'

// 🚀 Start the bot
venom
  .create({
    headless: false,
    browserPath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    session: 'bot-session',
  })
  .then((client) => start(client))
  .catch((err) => {
    console.error('❌ Failed to start bot:', err);
  });

// Message handling
function start(client) {
  console.log('✅ Bot is running...');

  client.onMessage(async (message) => {
    const lowerText = message.body?.toLowerCase() || '';
    const triggered = TRIGGER_KEYWORDS.some((kw) => lowerText.includes(kw));

    if (triggered) {
      try {
        const imagePath = path.join(__dirname, 'assets', 'menu.jpg');
        console.log('🧪 Checking image at path:', imagePath);

        if (!fs.existsSync(imagePath)) {
          console.error('❌ Image not found at:', imagePath);
          return;
        }

        // First, send a confirmation
        await client.sendText(message.from, '✅ Menu incoming...');

        // Then send the image
        await client.sendImage(
          message.from,
          imagePath,
          'menu.jpg',
          `Here’s our delicious menu! 🍔\nContact: ${PHONE_NUMBER}\norder here: ${order}`
        );

        console.log(`📤 Sent menu to: ${message.from}`);
      } catch (err) {
        console.error('❌ Could not send image:', err.message || err);
      }
    }
  });
}