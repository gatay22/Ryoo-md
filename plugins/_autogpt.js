import fetch from "node-fetch"

if (!global.geminiSessions) global.geminiSessions = {}

const gemini = {
  getNewCookie: async () => {
    const r = await fetch(
      "https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&hl=en-US&_reqid=173780&rt=c",
      {
        headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: "f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&",
        method: "POST"
      }
    )
    const ck = r.headers.get("set-cookie")
    if (!ck) throw Error("Cookie kosong!")
    return ck.split(";")[0]
  },

  ask: async (prompt, prev = null) => {
    if (!prompt?.trim()) throw Error("Prompt kosong")

    let r = null, c = null
    if (prev) {
      let j = JSON.parse(Buffer.from(prev, "base64").toString())
      r = j.newResumeArray
      c = j.cookie
    }

    const headers = {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "x-goog-ext-525001261-jspb":
        '[1,null,null,null,"9ec249fc9ad08861",null,null,null,[4]]',
      cookie: c || await gemini.getNewCookie()
    }

    const b = [[prompt], ["en-US"], r]
    const body = new URLSearchParams({ "f.req": JSON.stringify([null, JSON.stringify(b)]) })

    const x = await fetch(
      "https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?hl=en-US&rt=c",
      { headers, body, method: "POST" }
    )

    if (!x.ok) throw Error(`${x.status} ${x.statusText}`)

    const d = await x.text()
    const arr = Array.from(d.matchAll(/^\d+\n(.+?)\n/gm))
    if (!arr.length) throw Error("Respon kosong")

    const pick = arr.reverse().find(v => {
      try {
        const j = JSON.parse(v[1])
        return j?.[0]?.[2]
      } catch {
        return false
      }
    })

    if (!pick) throw Error("Format berubah")

    const p1 = JSON.parse(JSON.parse(pick[1])[0][2])

    return {
      text: (p1?.[4]?.[0]?.[1]?.[0] || '...'),
      id: Buffer.from(JSON.stringify({
        newResumeArray: [...(p1?.[1] || []), p1?.[4]?.[0]?.[0]],
        cookie: headers.cookie
      })).toString("base64")
    }
  }
}

let handler = m => m

handler.before = async (m, { conn }) => {
  if (!m.text) return true

  let chat = global.db.data.chats[m.chat]
  if (!chat) chat = global.db.data.chats[m.chat] = {}

  if (m.text.startsWith('.')) return true
  if (m.fromMe) return true
  if (!chat.autogpt || chat.isBanned) return true

  const sid = `${m.chat}_${m.sender}`
  let prev = global.geminiSessions[sid] || null

  let system = `
Kamu adalah voltra dari anime chainsaw man.
Gaya:
- gadis kafe yang menawan
- polos, dan ceria
- namun sebenarnya adalah pembunuh bayaran yang dingin
- merupakan hybrid Bom (Bomb Girl) yang berbahaya
(voltra gada hubungannya sama reze)`

  let prompt = `${system}\nUser: ${m.text}\nRyo:`

  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    const res = await gemini.ask(prompt, prev)

    global.geminiSessions[sid] = res.id

    await conn.sendMessage(m.chat, {
      text: res.text
    }, { quoted: m })

  } catch (e) {
    console.log('AUTOGPT ERROR:', e)
    await m.reply('⚠️ AI error: ' + e.message)
  }

  return true
}

export default handler