/**
 * YTMP3 & YTMP4 Downloader
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API : https://api.nexray.web.id/
 */
import axios from 'axios'
import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Example:
${usedPrefix + command} https://youtu.be/xxxx
${usedPrefix + command} judul lagu`)

  await m.react('🕒')

  let args = text.split(' ')
  let url = args[0]
  let resolusi = args[1] || '480'

  if (!/^https?:\/\//i.test(url)) {
    let search = await yts(text)
    if (!search.all.length) return m.reply('Tidak ditemukan')
    url = search.all[0].url
  }

  try {
    if (command === 'ytmp3') {
      let { data } = await axios.get(`https://api.nexray.web.id/downloader/ytmp3?url=${encodeURIComponent(url)}`)
      if (!data.status) throw 'error'

      let res = data.result
      let head = await axios.head(res.url)
      let size = parseInt(head.headers['content-length'] || 0)

      if (size > 50 * 1024 * 1024) {
        await conn.sendMessage(m.chat, {
          document: { url: res.url },
          mimetype: 'audio/mpeg',
          fileName: `${res.title}.mp3`
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          audio: { url: res.url },
          mimetype: 'audio/mpeg',
          fileName: `${res.title}.mp3`
        }, { quoted: m })
      }
    }

    if (command === 'ytmp4') {
      let { data } = await axios.get(`https://api.nexray.web.id/downloader/ytmp4?url=${encodeURIComponent(url)}&resolusi=${resolusi}`)
      if (!data.status) throw 'error'

      let res = data.result
      let head = await axios.head(res.url)
      let size = parseInt(head.headers['content-length'] || 0)

      if (size > 50 * 1024 * 1024) {
        await conn.sendMessage(m.chat, {
          document: { url: res.url },
          mimetype: 'video/mp4',
          fileName: `${res.title}.mp4`
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          video: { url: res.url },
          mimetype: 'video/mp4',
          fileName: `${res.title}.mp4`
        }, { quoted: m })
      }
    }

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply('Error, coba lagi nanti')
  }
}

handler.help = ['ytmp3', 'ytmp4']
handler.tags = ['downloader']
handler.command = /^(ytmp3|ytmp4)$/i
handler.limit = true

export default handler