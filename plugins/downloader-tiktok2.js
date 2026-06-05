import { tiktok } from '../lib/scrape/tiktok.js'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Masukkan link TikTok')

  await m.react('✨')

  try {
    let res = await tiktok(text)

    let caption = `
# *TIKTOK DOWNLOADER*

> *Author*: ${res.author.nickname || res.author.username}
> *Caption*: ${res.desc || '-'}
    `.trim()

    if (res.type === 'slide') {
      let i = 1
      for (let img of res.images) {
        await conn.sendMessage(m.chat, {
          image: { url: img },
          caption: `${caption}\n\n> Slide ${i++}/${res.images.length}`
        }, { quoted: m })
      }

      if (res.audio) {
        await conn.sendMessage(m.chat, {
          audio: { url: res.audio },
          mimetype: 'audio/mpeg'
        }, { quoted: m })
      }

      return
    }

    if (res.video?.length) {
      await conn.sendMessage(m.chat, {
        video: { url: res.video[0].url },
        caption
      }, { quoted: m })
    }

    if (res.audio) {
      await conn.sendMessage(m.chat, {
        audio: { url: res.audio },
        mimetype: 'audio/mpeg'
      }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    m.reply('Gagal ambil TikTok')
  }
}

handler.help = ['tt2', 'tiktok2']
handler.tags = ['downloader']
handler.command = /^(tt2|tiktok2)$/i
handler.limit = true

export default handler