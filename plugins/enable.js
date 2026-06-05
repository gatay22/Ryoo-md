let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /^(enable|on)$/i.test(command)
  let chat = global.db.data.chats[m.chat]
  if (!chat) chat = global.db.data.chats[m.chat] = {}

  let type = (args[0] || '').toLowerCase()
  let isAll = false

  switch (type) {
    case 'welcome':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.welcome = isEnable
      break

    case 'delete':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.delete = isEnable
      break

    case 'antidelete':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiDelete = isEnable
      break

    case 'antilink':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiLink = isEnable
      break

    case 'antibadword':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiBadword = isEnable
      break

    case 'autogpt':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.autogpt = isEnable
      break

    case 'rpg':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.rpgs = isEnable
      break

    case 'autolevelup':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      chat.autolevelup = isEnable
      break

    case 'public':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts.self = !isEnable
      break

    case 'autoread':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts.autoread = isEnable
      break

    case 'pconly':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts.pconly = isEnable
      break

    case 'gconly':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts.gconly = isEnable
      break

    case 'self':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts.self = isEnable
      break

    default:
      return m.reply(`
List option:

Admin:
| antilink
| antibadword
| antidelete
| delete
| rpg
| welcome

Owner:
| public
| self
| autoread
| pconly
| gconly
| autolevelup

Contoh:
${usedPrefix}enable rpg
`.trim())
  }

  let target = 'untuk chat ini'
  if (isAll) target = 'untuk bot ini'
  else if (m.isGroup && isAdmin) target = 'untuk grup ini'

  m.reply(`*${type}* berhasil di *${isEnable ? 'nyala' : 'mati'}kan* ${target}`)
}

handler.help = ['enable', 'disable']
handler.tags = ['group', 'owner']
handler.command = /^(enable|disable|on|off)$/i

export default handler