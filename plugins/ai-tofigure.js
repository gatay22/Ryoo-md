import { nanobanana } from '../lib/scrape/nanobanana.js'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime)) return m.reply('Reply gambar')

  await m.reply('wait')

  let prompt = `Using the nano-banana model, a commercial 1/7 scale figurine of the character in the picture was created, depicting a realistic style and a realistic environment. The figurine is placed on a computer desk with a round transparent acrylic base. There is no text on the base. The computer screen shows the Zbrush modeling process of the figurine. Next to the computer screen is a BANDAI-style toy box with the original painting printed on it`

  try {
    let buffer = await q.download()
    let img = await nanobanana(buffer, prompt)

    await conn.sendMessage(m.chat, {
      image: { url: img }
    }, { quoted: m })
  } catch (e) {
    console.log(e)
    m.reply('Gagal proses')
  }
}

handler.help = ['tofigure']
handler.tags = ['ai']
handler.command = /^tofigure$/i
handler.limit = true

export default handler