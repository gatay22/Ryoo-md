let handler = async (m, { conn }) => {
  let chats = global.db.data.chats || {}
  let banned = Object.entries(chats)
    .filter(([jid, data]) => jid.endsWith('@g.us') && data?.isBanned)

  if (!banned.length)
    return m.reply('✅ Tidak ada grup yang sedang dibanned.')

  let teks = '📛 *DAFTAR GRUP KEBANNED*\n\n'
  let buttons = []

  for (let i = 0; i < banned.length; i++) {
    let [jid] = banned[i]
    let name = 'Unknown Group'
    try {
      let meta = await conn.groupMetadata(jid)
      name = meta.subject
    } catch {}

    teks += `${i + 1}. ${name}\n`
    teks += `   ${jid}\n\n`

    buttons.push({
      name: 'cta_copy',
      buttonParamsJson: JSON.stringify({
        display_text: `📋 Copy ID GC #${i + 1}`,
        copy_code: jid
      })
    })
  }

  await conn.sendMessage(m.chat, {
    text: teks.trim(),
    footer: '📌 Klik tombol untuk menyalin ID grup',
    interactiveButtons: buttons
  }, { quoted: m })
}

handler.help = ['listbanchat']
handler.tags = ['owner']
handler.command = /^listbanchat$/i
handler.owner = true
handler.limit = false

export default handler