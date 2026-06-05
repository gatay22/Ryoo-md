/**
 * fitur : StickerLy
 * author : Hilman 
 * channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * source Scrape : https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/542
**/

import axios from 'axios'
import { createSticker, StickerTypes } from 'wa-sticker-formatter'

class StickerLy {
  constructor() {
    this.base = 'https://api.sticker.ly/v4'
    this.headers = {
      'user-agent': 'androidapp.stickerly/3.17.0',
      'content-type': 'application/json'
    }
  }

  async search(query) {
    const { data } = await axios.post(
      `${this.base}/stickerPack/smartSearch`,
      {
        keyword: query,
        enabledKeywordSearch: true,
        filter: {
          extendSearchResult: false,
          sortBy: 'RECOMMENDED',
          languages: ['ALL'],
          minStickerCount: 5,
          searchBy: 'ALL',
          stickerType: 'ALL'
        }
      },
      { headers: this.headers }
    )

    return (data?.result?.stickerPacks || []).map(v => ({
      name: v.name,
      slug: v.shareUrl.match(/\/s\/([^\/\?#]+)/)?.[1],
      total: v.resourceFiles.length
    }))
  }

  async detail(slug) {
    const { data } = await axios.get(
      `${this.base}/stickerPack/${slug}?needRelation=true`,
      { headers: this.headers }
    )

    return {
      title: data.result.name,
      prefix: data.result.resourceUrlPrefix,
      stickers: data.result.stickers
    }
  }
}

const scraper = new StickerLy()

let handler = async (m, { conn, args, usedPrefix, command }) => {

  if (command === 'stlysend') {
    const slug = args[0]
    if (!slug) return

    m.reply('✨ Mengirim sticker...')

    try {
      const res = await scraper.detail(slug)

      for (const s of res.stickers) {
        try {
          const img = await axios.get(res.prefix + s.fileName, {
            responseType: 'arraybuffer'
          })

          const sticker = await createSticker(Buffer.from(img.data), {
            pack: 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ',
            author: 'ʙy ʜɪʟᴍᴀɴ',
            animated: s.isAnimated,
            type: s.isAnimated ? StickerTypes.FULL : StickerTypes.DEFAULT
          })

          await conn.sendMessage(m.chat, { sticker }, { quoted: m })
          await new Promise(r => setTimeout(r, 1200))
        } catch {}
      }

      m.reply('✨ Selesai')
    } catch {
      m.reply('✨ Gagal mengambil sticker')
    }
    return
  }

  if (!args.length)
    return m.reply(`✨ Contoh:\n${usedPrefix + command} ryo yamada`)

  const packs = await scraper.search(args.join(' '))
  if (!packs.length) return m.reply('✨ Sticker pack tidak ditemukan')

  const rows = packs.slice(0, 10).map(p => ({
    title: p.name,
    description: `Total ${p.total} sticker`,
    id: `${usedPrefix}stlysend ${p.slug}`
  }))

  await conn.sendMessage(m.chat, {
    text: '✨ HASIL STICKERLY',
    footer: 'Klik untuk kirim sticker pack',
    buttons: [
      {
        buttonId: 'stly_select',
        buttonText: { displayText: '✨ Pilih Sticker' },
        type: 4,
        nativeFlowInfo: {
          name: 'single_select',
          paramsJson: JSON.stringify({
            title: 'StickerLy',
            sections: [
              {
                title: 'Daftar Sticker Pack',
                rows
              }
            ]
          })
        }
      }
    ],
    headerType: 1,
    viewOnce: true
  }, { quoted: m })
}

handler.help = ['stickerly <query>']
handler.tags = ['sticker']
handler.command = /^(stly|stickerly|stlysend)$/i
handler.limit = true

export default handler