import { fileTypeFromBuffer } from 'file-type'
import FormData from 'form-data'
import fetch from 'node-fetch'
import { generateWAMessageFromContent, proto } from '@adiwajshing/baileys'

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

async function uploadTmpfiles(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || {}
  const form = new FormData()
  form.append('file', buffer, `upload-${Date.now()}.${ext || 'bin'}`)

  const res = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: form,
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0'
    }
  })

  const json = await res.json()
  const match = /https?:\/\/tmpfiles\.org\/(.*)/.exec(json?.data?.url)
  if (!match) throw 'Tmpfiles gagal'

  return `https://tmpfiles.org/dl/${match[1]}`
}

async function uploadCatbox(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || {}
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, `file.${ext || 'bin'}`)

  const res = await fetchWithTimeout(
    'https://catbox.moe/user/api.php',
    { method: 'POST', body: form },
    5000
  )

  const text = (await res.text()).trim()
  if (!text.startsWith('https://')) throw 'Catbox down'

  return text
}

let handler = async (m, { conn }) => {
  let q = m.quoted || m
  let mime = (q.msg || q).mimetype

  if (!mime) {
    await m.react('❌')
    return m.reply('Reply media nya')
  }

  let buffer = await q.download().catch(() => null)
  if (!buffer) {
    await m.react('❌')
    return m.reply('Gagal ambil media')
  }

  await m.react('✨')

  let mimeType = (await fileTypeFromBuffer(buffer))?.mime || '-'

  let tmp = null
  let catbox = null

  try { tmp = await uploadTmpfiles(buffer) } catch {}
  try { catbox = await uploadCatbox(buffer) } catch {}

  if (!tmp && !catbox) {
    await m.react('❌')
    return m.reply('Semua uploader gagal 😓')
  }

  await m.react('✅')

  const text = `
✅ *Upload selesai*

📂 Mime: ${mimeType}

☁️ Tmpfiles: ${tmp || 'Gagal'}
⏳ Status: ${tmp ? 'Expired (sementara)' : '-'}

📦 Catbox : ${catbox || 'Gagal'}
♾️ Status: ${catbox ? 'Non-expired' : '-'}

📢 Tekan tombol untuk copy link
`.trim()

  let buttons = []

  if (tmp) {
    buttons.push({
      name: "cta_copy",
      buttonParamsJson: JSON.stringify({
        display_text: "📋 Copy Tmpfiles",
        copy_code: tmp
      })
    })
  }

  if (catbox) {
    buttons.push({
      name: "cta_copy",
      buttonParamsJson: JSON.stringify({
        display_text: "📋 Copy Catbox",
        copy_code: catbox
      })
    })
  }

  try {
    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({ text }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: global.wm || 'Uploader Bot'
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons
            })
          })
        }
      }
    }, {})

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch {
    await conn.sendMessage(m.chat, { text }, { quoted: m })
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^tourl$/i
handler.limit = false

export default handler