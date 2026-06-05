import { nanobanana } from '../lib/scrape/nanobanana.js'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime)) return m.reply('Reply gambar')

  await m.react('🕒')

  let prompt = 'ubah karakter ini menjadi berkulit hitam pekat, bukan coklat, seluruh kulit terlihat hitam solid, tone gelap natural, high quality, detail wajah jelas'

  try {
    let buffer = await q.download()
    let img = await nanobanana(buffer, prompt)

    await conn.sendMessage(m.chat, {
      image: { url: img }
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.log(e)
    await m.react('❌')
    m.reply('Gagal proses')
  }
}

handler.help = ['hitamkan']
handler.tags = ['ai']
handler.command = /^hitamkan$/i
handler.limit = true

export default handler