import axios from 'axios'
import { uguu } from '../lib/scrape/uguu.js'

let handler = async (m, { conn, text, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!text && !/image/.test(mime)) return m.reply('Kirim/reply gambar atau url')

  await m.reply('wait')

  try {
    let url = text

    if (!url && /image/.test(mime)) {
      let media = await q.download()
      let up = await uguu(media)
      url = up.url
    }

    let result

    if (/^todino$/i.test(command)) {
      let api = `https://api-hara.vercel.app/ai/todino?url=${encodeURIComponent(url)}`
      let res = await axios.get(api)
      result = res.data?.image
    } else {
      let endpoint = command === 'tocermin2' || command === 'tocerminv2'
        ? 'tocerminv2'
        : 'tocermin'

      let api = `https://api-hara.vercel.app/ai/${endpoint}?url=${encodeURIComponent(url)}`
      let res = await axios.get(api, { responseType: 'arraybuffer' })
      return await conn.sendFile(m.chat, res.data, 'result.jpg', '', m)
    }

    if (!result) throw 'No result'

    await conn.sendFile(m.chat, result, 'result.jpg', '', m)

  } catch (e) {
    console.log(e)
    m.reply('Gagal proses gambar')
  }
}

handler.help = ['tocermin', 'tocermin2', 'todino']
handler.tags = ['ai']
handler.command = /^(tocermin2?|tocerminv2|todino)$/i
handler.limit = true

export default handler