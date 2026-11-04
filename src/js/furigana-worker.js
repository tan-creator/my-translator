// Furigana worker: kuromoji tokenizing off the main thread so transcript rendering never waits.
// In: { text }  Out: { text, html }  (html = escaped text with <ruby> over kanji, okurigana left bare)
importScripts('../vendor/kuromoji/kuromoji.js');

const KANJI = /[㐀-鿿豈-﫿々]/;
const esc = s => s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

// Ruby only on the kanji part: strip kana shared at the start/end (okurigana like 食[た]べる).
function rubyToken(surface, reading) {
    if (!KANJI.test(surface) || !reading) return esc(surface);
    const s = toHira(surface);
    let r = toHira(reading);
    let a = 0, b = 0;
    while (a < s.length - 1 && !KANJI.test(s[a]) && s[a] === r[a]) a++;
    while (b < s.length - a - 1 && !KANJI.test(s[s.length - 1 - b]) && s[s.length - 1 - b] === r[r.length - 1 - b]) b++;
    r = r.slice(a, r.length - b);
    const base = surface.slice(a, surface.length - b);
    if (!r || r === toHira(base)) return esc(surface);
    return esc(surface.slice(0, a)) + `<ruby>${esc(base)}<rt>${esc(r)}</rt></ruby>` + esc(surface.slice(surface.length - b));
}

const ready = new Promise((resolve, reject) =>
    kuromoji.builder({ dicPath: '../vendor/kuromoji/dict/' }).build((err, t) => err ? reject(err) : resolve(t)));

self.onmessage = async ({ data: { text } }) => {
    try {
        const tokenizer = await ready;
        const html = tokenizer.tokenize(text).map(t => rubyToken(t.surface_form, t.reading)).join('');
        self.postMessage({ text, html });
    } catch (e) {
        self.postMessage({ text, html: null, error: String(e) });
    }
};
