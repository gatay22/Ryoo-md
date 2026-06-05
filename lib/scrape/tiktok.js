export async function tiktok(url) {
  const res = await fetch('https://lovetik.com/api/ajax/search', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'origin': 'https://lovetik.com',
      'referer': 'https://lovetik.com/id',
      'user-agent': 'Mozilla/5.0',
      'x-requested-with': 'XMLHttpRequest',
    },
    body: `query=${encodeURIComponent(url)}`,
  })

  const data = await res.json()

  if (!data || data.error) throw 'Video tidak ditemukan'

  const isSlide = Array.isArray(data.images) && data.images.length > 0

  const clean = str =>
    str?.replace(/<[^>]+>/g, '')
      .replace(/[^\w\s]/g, '')
      .trim()

  const links = data.links || []

  const audio = links.find(v => v.ft == 3 && v.a)

  const downloads = links
    .filter(v => v.ft != 3 && v.a)
    .map(v => ({
      quality: v.s?.replace(/\[.*?\]/g, '').trim() || clean(v.t),
      url: v.a,
    }))

  return {
    type: isSlide ? 'slide' : 'video',
    desc: data.desc,
    cover: data.cover,
    author: {
      username: data.author,
      nickname: data.author_name,
      avatar: data.author_a,
    },
    images: isSlide ? data.images : null,
    video: !isSlide ? downloads : null,
    audio: audio?.a || null
  }
}