/**
 * Maker Brat Waifu
 * -----------------------------
 * Type   : Plugins ESM
 * Creator : Hilman
 * Source : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API    : https://x.0cd.fun
 */
 
import { Sticker } from 'wa-sticker-formatter'
import fetch from 'node-fetch'

const characters = [
  '2b',
  'alya',
  'elaina',
  'hinata',
  'mikasa',
  'nami',
  'nobara',
  'tsunade',
  'yor'
]

const colors = {
  hitam: '#111111',
  putih: '#ffffff',
  merah: '#ff3b3b',
  biru: '#3b82f6',
  hijau: '#22c55e',
  kuning: '#facc15',
  ungu: '#a855f7',
  pink: '#ff69b4',
  abu: '#6b7280',
  orange: '#fb923c'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text && !(m.quoted && m.quoted.text)) {
    return m.reply(
`✨ *BRAT WAIFU CANVAS*

🌌 Karakter:
${characters.map(v => `• ${v}`).join('\n')}

🔮 Warna:
• hitam • putih • merah • biru • hijau
• kuning • ungu • pink • abu • orange

🕯️ Cara pakai:
${usedPrefix + command} halo hilman
${usedPrefix + command} halo hilman|elaina
${usedPrefix + command} halo hilman|mikasa|merah
${usedPrefix + command} halo hilman|yor|pink

_Reply atau masukkan teks._`
    )
  }

  if (m.quoted && m.quoted.text) {
    text = m.quoted.text
  }

  let [msg, char = 'elaina', color = 'hitam', font = 'Melon Pop'] =
    text.split('|').map(v => v.trim())

  char = char.toLowerCase()

  if (!characters.includes(char)) {
    return m.reply(`Karakter tidak tersedia!

Ketik *${usedPrefix + command}* untuk melihat list.`)
  }

  color = colors[color?.toLowerCase()] || '#111111'

  try {
    await m.react('🪄')

    const url = `https://x.0cd.fun/canvas/brat/waifu?text=${encodeURIComponent(msg)}&character=${char}&color=${encodeURIComponent(color)}&font=${encodeURIComponent(font)}&max=100`

    const res = await fetch(url)
    const buffer = await res.buffer()

    const sticker = await new Sticker(buffer, {
      pack: 'ᴠᴏʟᴛʀᴀ - ᴍᴅ',
      author: 'ʙy ᴠɪɪɴxʏ',
      type: 'crop',
      quality: 100
    }).toBuffer()

    await conn.sendFile(m.chat, sticker, 'bratwaifu.webp', '', m)
    await m.react('✨')

  } catch (e) {
    await m.react('❌')
    throw 'Gagal membuat stiker'
  }
}

handler.help = ['bratwaifu']
handler.tags = ['sticker']
handler.command = /^bratwaifu$/i
handler.limit = true

export default handler