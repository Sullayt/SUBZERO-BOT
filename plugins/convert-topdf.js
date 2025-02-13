 const { cmd } = require("../command");
const { Telegraph } = require('telegraph');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: "upload",
  alias: ["share"],
  desc: "Upload videos, pictures, or stickers and get a shareable URL.",
  category: "utility",
  use: ".upload (reply to a video, image, or sticker)",
  filename: __filename,
}, async (conn, mek, msg, { from, reply, quoted }) => {
  try {
    if (!quoted) {
      return reply("❌ Please reply to a video, image, or sticker to upload.");
    }

    // Check if the quoted message contains a video, image, or sticker
    const mediaTypes = ['imageMessage', 'videoMessage', 'stickerMessage'];
    if (!mediaTypes.includes(quoted.mtype)) {
      return reply("❌ Unsupported media type. Please reply to a video, image, or sticker.");
    }

    // Download the media file
    const media = await conn.downloadMediaMessage(quoted);
    const filePath = path.join(__dirname, `temp_${Date.now()}.${quoted.mtype === 'stickerMessage' ? 'webp' : quoted.mtype === 'imageMessage' ? 'jpg' : 'mp4'}`);
    fs.writeFileSync(filePath, media);

    // Upload to Telegra.ph
    const telegraph = new Telegraph();
    const uploadResponse = await telegraph.uploadFile(filePath);

    // Delete the temporary file
    fs.unlinkSync(filePath);

    // Send the URL
    const mediaType = quoted.mtype === 'videoMessage' ? 'Video' : quoted.mtype === 'imageMessage' ? 'Image' : 'Sticker';
    reply(`✅ *${mediaType} Uploaded Successfully!*\n\n🔗 *URL:* ${uploadResponse.url}`);

  } catch (error) {
    console.error("Error uploading media:", error);
    reply("❌ Failed to upload media. Please try again.");
  }
});
