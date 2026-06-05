/*

# Fitur : Sticker Animebrat
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029Vb67i65Fi8xX7rOtIc2S
# Watermark : hanzxd
# Api : https://api.nexray.web.id

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

import fetch from 'node-fetch';
import sharp from 'sharp';
import { Sticker } from 'wa-sticker-formatter'; // Tambahan untuk inject metadata (Exif)

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Masukkan teks untuk stiker.');

    try {
        const apiUrl = `https://api.nexray.web.id/maker/bratanime?text=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        const buffer = await response.arrayBuffer();

        // Konversi ke format webp agar bisa digunakan di WhatsApp
        const webpBuffer = await sharp(Buffer.from(buffer))
            .toFormat('webp')
            .toBuffer();

        // Proses penambahan watermark hanzxd ke metadata stiker
        const stickerWM = new Sticker(webpBuffer, {
            pack: 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ',
            author: 'ʙy ʜɪʟᴍᴀɴ'
        });
        const finalSticker = await stickerWM.toBuffer();

        await conn.sendMessage(m.chat, { 
            sticker: finalSticker 
        }, { quoted: m });
    } catch (e) {
        console.error(e);
        m.reply('Terjadi kesalahan saat membuat stiker.');
    }
};

handler.command = ['animebrat'];
handler.help = ['animebrat'];
handler.tags = ['sticker']; 

export default handler;