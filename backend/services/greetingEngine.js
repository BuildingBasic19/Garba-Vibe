// Local phrase engine. This is NOT an AI model: it combines hand-written phrases.
// To add a real AI provider later, call it here using process.env.AI_API_KEY.
const POOL = {
  en: {
    open: ['Jai Mata Di!', 'Shubh Navratri!', 'Happy Navratri!'],
    main: ['May these nine nights fill your home with light, joy and togetherness.', 'Wishing you nine days of devotion, music and new beginnings.', 'May the festive glow of the diyas brighten every corner of your life.'],
    bless: ['May Maa Durga bless you with courage and peace.', 'May strength and kindness walk with you always.', 'May every day ahead feel a little more divine.'],
    close: ['Celebrate with love.', 'Stay blessed.', 'With warm wishes.']
  },
  hi: {
    open: ['जय माता दी!', 'शुभ नवरात्रि!', 'नवरात्रि की हार्दिक शुभकामनाएँ!'],
    main: ['ये नौ रातें आपके घर में प्रकाश, खुशियाँ और अपनापन लाएँ।', 'भक्ति, संगीत और नई शुरुआत से भरे नौ दिनों की शुभकामनाएँ।', 'दीपों की रौशनी आपके जीवन के हर कोने को जगमग करे।'],
    bless: ['माँ दुर्गा आपको साहस और शांति का आशीर्वाद दें।', 'शक्ति और सद्भाव सदा आपके साथ रहें।', 'आने वाला हर दिन और भी शुभ हो।'],
    close: ['प्रेम से मनाइए।', 'आप पर कृपा बनी रहे।', 'सप्रेम शुभकामनाओं सहित।']
  },
  hinglish: {
    open: ['Jai Mata Di!', 'Shubh Navratri!', 'Navratri ki hardik shubhkamnayein!'],
    main: ['Ye nau raatein aapke ghar mein roshni, khushiyan aur apnapan layein.', 'Bhakti, music aur nayi shuruaat se bhare nau dinon ki shubhkamnayein.', 'Diyon ki roshni aapki zindagi ke har kone ko jagmag kare.'],
    bless: ['Maa Durga aapko himmat aur shanti ka ashirwad dein.', 'Shakti aur acchai hamesha aapke saath rahe.', 'Aane wala har din aur bhi shubh ho.'],
    close: ['Pyaar se manaiye.', 'Aap par kripa bani rahe.', 'Dher saari shubhkamnayein.']
  }
};
const pick = a => a[Math.floor(Math.random() * a.length)];

function generate({ language = 'en', length = 'medium', signature = '', count = 3 } = {}) {
  const p = POOL[language];
  if (!p) throw Object.assign(new Error('language must be en, hi or hinglish'), { status: 400 });
  if (!['short', 'medium', 'long'].includes(length)) throw Object.assign(new Error('length must be short, medium or long'), { status: 400 });
  const sig = String(signature).slice(0, 40);
  const out = new Set();
  for (let tries = 0; out.size < count && tries < 40; tries++) {
    const parts = [pick(p.open), pick(p.main)];
    if (length !== 'short') parts.push(pick(p.bless));
    if (length === 'long') parts.push(pick(p.close));
    if (sig) parts.push('— ' + sig);
    out.add(parts.join('\n'));
  }
  return [...out].map(text => ({ text }));
}
module.exports = { generate };
