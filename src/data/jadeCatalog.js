const commonsFile = (fileName) =>
  `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}`

const commonsPage = (fileName) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName).replace(/%20/g, '_')}`

const LOCAL_FALLBACKS = {
  玉璧: '/gallery/jade-bi-disc.jpg',
  玉琮: '/gallery/liangzhu-jade-cong.jpg',
  玉龙: '/gallery/hongshan-jade-dragon.jpg',
  玉蝉: '/gallery/han-jade-cicada.jpg',
  玉佩: '/gallery/jade-bi-disc.jpg',
  玉如意: '/gallery/han-jade-cicada.jpg',
  玉带板: '/gallery/jade-bi-disc.jpg',
  山水牌: '/gallery/liangzhu-jade-cong.jpg',
}

const fallbackForExhibit = (name) => {
  if (name.includes('琮') || name.includes('兽 面')) return LOCAL_FALLBACKS.玉琮
  if (name.includes('龙') && !name.includes('龙 首')) return LOCAL_FALLBACKS.玉龙
  if (name.includes('蝉')) return LOCAL_FALLBACKS.玉蝉
  if (name.includes('璧') || name.includes('璜') || name.includes('佩') || name.includes('带 板')) return LOCAL_FALLBACKS.玉璧
  if (name.includes('如 意')) return LOCAL_FALLBACKS.玉如意
  if (name.includes('山 水')) return LOCAL_FALLBACKS.山水牌
  return LOCAL_FALLBACKS.玉璧
}

export const JADE_FORMS = ['玉佩', '玉璧', '玉琮', '玉如意', '山水牌', '玉龙', '玉蝉', '玉带板']
export const JADE_PATTERNS = ['云纹', '龙纹', '谷纹', '兽面纹', '凤鸟纹', '缠枝纹', '回纹', '山水纹']
export const JADE_COLORS = ['羊脂白玉', '青白玉', '碧玉', '墨玉', '黄玉', '青玉']

export const FORM_PROMPTS = {
  玉佩: 'a flat wearable Chinese jade pendant plaque with a suspension hole, palm-sized, thin carved slab, not a freestanding statue',
  玉璧: 'a circular Chinese jade bi disc with a perfect central round hole, flat ritual disc form, low relief carving',
  玉琮: 'a square outer and round inner Chinese jade cong ritual tube, upright geometric ritual vessel, not an animal figure',
  玉如意: 'a Chinese jade ruyi scepter or ruyi-head pendant, flattened curved handle with lingzhi-cloud shaped head, elegant ceremonial object, not an animal statue',
  山水牌: 'a rectangular Chinese jade landscape plaque, flat pendant tablet with shallow relief mountain-and-water scene',
  玉龙: 'a Hongshan-style C-shaped Chinese jade dragon, compact curled silhouette, polished archaic ritual object',
  玉蝉: 'a Han dynasty jade cicada, small symmetrical cicada form with concise blade-cut planes',
  玉带板: 'a rectangular or arched Chinese jade belt plaque, shallow relief carving, clothing ornament scale',
}

export const PATTERN_PROMPTS = {
  云纹: 'stylized Chinese cloud-scroll ornament carved as shallow relief lines',
  龙纹: 'archaic Chinese dragon-scroll motif carved on the surface as ornament, not a dragon body statue unless the selected form is jade dragon',
  谷纹: 'raised grain pattern, dense small rounded bosses arranged in ritual jade style',
  兽面纹: 'taotie beast-mask motif, symmetrical ancient bronze-style mask pattern carved only as surface ornament',
  凤鸟纹: 'phoenix-bird motif carved as elegant linear ornament, not a full bird statue',
  缠枝纹: 'interlocking vine-scroll floral ornament in shallow relief',
  回纹: 'Chinese key-fret geometric meander border pattern',
  山水纹: 'miniature mountain-and-water landscape relief, shallow carved scene, literati plaque composition',
}

export const COLOR_PROMPTS = {
  羊脂白玉: 'warm mutton-fat white Hetian nephrite, soft translucent waxy luster',
  青白玉: 'pale celadon-white nephrite with subtle cloudy translucency',
  碧玉: 'deep spinach-green nephrite, natural mineral speckles, waxy stone luster, not plastic',
  墨玉: 'dark black-green nephrite with understated translucency at thin edges',
  黄玉: 'warm honey-yellow nephrite with natural stone texture',
  青玉: 'cool green-gray nephrite, restrained mineral clouding and waxy polish',
}

export const REFERENCE_LIBRARY = [
  {
    id: 'bi-british-museum',
    title: 'British Museum 玉璧',
    form: '玉璧',
    patterns: ['谷纹', '龙纹'],
    colors: ['青玉', '青白玉'],
    image: commonsFile('Jade Bi, British Museum.jpg'),
    fallbackImage: LOCAL_FALLBACKS.玉璧,
    source: commonsPage('Jade Bi, British Museum.jpg'),
    instruction: 'Use Image 1 as the strict round bi-disc silhouette reference: flat circular jade disc, central hole, carved archaic surface details.',
  },
  {
    id: 'bi-han-dragon',
    title: '西汉龙纹玉璧',
    form: '玉璧',
    patterns: ['龙纹', '谷纹'],
    colors: ['青玉', '碧玉'],
    image: commonsFile("Jade Bi Disk with Dragon Design unearthed from the King's tomb at Shizishan Hill.jpg"),
    fallbackImage: LOCAL_FALLBACKS.玉璧,
    source: commonsPage("Jade Bi Disk with Dragon Design unearthed from the King's tomb at Shizishan Hill.jpg"),
    instruction: 'Use Image 1 for the dragon-pattern jade bi composition and pierced ritual disc proportion.',
  },
  {
    id: 'cong-british-museum',
    title: '良渚文化玉琮',
    form: '玉琮',
    patterns: ['兽面纹'],
    colors: ['青玉', '青白玉'],
    image: commonsFile('British Museum Chinese jade Neolithic period Liangzhu culture Cong 11022019 1433.jpg'),
    fallbackImage: LOCAL_FALLBACKS.玉琮,
    source: commonsPage('British Museum Chinese jade Neolithic period Liangzhu culture Cong 11022019 1433.jpg'),
    instruction: 'Use Image 1 as the strict cong vessel reference: square outer body, round inner tube, stacked corners and Liangzhu ritual geometry.',
  },
  {
    id: 'cong-mask-detail',
    title: '良渚兽面纹参考',
    form: '玉琮',
    patterns: ['兽面纹'],
    colors: ['青白玉'],
    image: commonsFile('Jade cong from the Liangzhu culture(Neolithic) in Zhejiang Museum(Partial view)2.jpg'),
    fallbackImage: LOCAL_FALLBACKS.玉琮,
    source: commonsPage('Jade cong from the Liangzhu culture(Neolithic) in Zhejiang Museum(Partial view)2.jpg'),
    instruction: 'Use Image 2 for Liangzhu beast-mask carving density and incised line discipline.',
  },
  {
    id: 'ruyi-met',
    title: '清中期玉如意',
    form: '玉如意',
    patterns: ['云纹', '缠枝纹'],
    colors: ['羊脂白玉', '青白玉'],
    image: commonsFile('清中期 玉如意-Ornament (Ruyi) MET 32834.jpg'),
    fallbackImage: LOCAL_FALLBACKS.玉如意,
    source: commonsPage('清中期 玉如意-Ornament (Ruyi) MET 32834.jpg'),
    instruction: 'Use Image 1 as the ruyi silhouette reference: long elegant handle and lingzhi-cloud head in polished nephrite.',
  },
  {
    id: 'pendant-huang-met',
    title: '西汉玉璜',
    form: '玉佩',
    patterns: ['龙纹', '云纹'],
    colors: ['青白玉', '黄玉'],
    image: commonsFile('西漢 玉璜-Arc-Shaped Pendant (Huang) MET 269580.jpg'),
    fallbackImage: LOCAL_FALLBACKS.玉佩,
    source: commonsPage('西漢 玉璜-Arc-Shaped Pendant (Huang) MET 269580.jpg'),
    instruction: 'Use Image 1 for wearable pendant scale, suspension-ready thinness, and archaic carved edges.',
  },
  {
    id: 'pendant-dragon-bm',
    title: '龙首玉佩',
    form: '玉佩',
    patterns: ['龙纹', '凤鸟纹'],
    colors: ['青白玉'],
    image: commonsFile('British Museum Chinese jade Eastern Zhou or Western Han dynasty Pendant with a dragon or tiger head 11022019 1551.jpg'),
    fallbackImage: LOCAL_FALLBACKS.玉佩,
    source: commonsPage('British Museum Chinese jade Eastern Zhou or Western Han dynasty Pendant with a dragon or tiger head 11022019 1551.jpg'),
    instruction: 'Use Image 1 for elongated pendant structure and archaic animal-head terminal details.',
  },
  {
    id: 'hongshan-dragon',
    title: '红山 C 形玉龙',
    form: '玉龙',
    patterns: ['龙纹'],
    colors: ['碧玉', '青玉', '墨玉'],
    image: commonsFile('Neolithic Hongshan Culture Jade Dragon, c. 4000-3000 BC.jpg'),
    fallbackImage: LOCAL_FALLBACKS.玉龙,
    source: commonsPage('Neolithic Hongshan Culture Jade Dragon, c. 4000-3000 BC.jpg'),
    instruction: 'Use Image 1 as the strict Hongshan jade dragon silhouette reference: C-shaped curled body, blunt snout, archaic compact mass.',
  },
  {
    id: 'belt-plaque-met',
    title: '明代玉带板',
    form: '玉带板',
    patterns: ['缠枝纹', '凤鸟纹', '回纹'],
    colors: ['羊脂白玉', '青白玉'],
    image: commonsFile('MET 10431.jpg'),
    fallbackImage: LOCAL_FALLBACKS.玉带板,
    source: commonsPage('MET 10431.jpg'),
    instruction: 'Use Image 1 for belt plaque relief depth, rectangular wearable format, and dense courtly carving.',
  },
  {
    id: 'belt-plaque-ming',
    title: '明代花鸟玉带板',
    form: '玉带板',
    patterns: ['缠枝纹', '凤鸟纹', '回纹'],
    colors: ['青白玉', '黄玉'],
    image: commonsFile('Ming Jade Belt Plaque 08.jpg'),
    fallbackImage: LOCAL_FALLBACKS.玉带板,
    source: commonsPage('Ming Jade Belt Plaque 08.jpg'),
    instruction: 'Use Image 2 for shallow relief plaque carving and floral-bird composition.',
  },
  {
    id: 'jade-cicada',
    title: '汉代玉蝉',
    form: '玉蝉',
    patterns: [],
    colors: ['羊脂白玉', '青白玉', '黄玉'],
    image: commonsFile('Han Jade Burial Cicada.jpg'),
    fallbackImage: LOCAL_FALLBACKS.玉蝉,
    source: commonsPage('Han Jade Burial Cicada.jpg'),
    instruction: 'Use Image 1 for concise Han cicada proportions and crisp planar blade cuts.',
  },
  {
    id: 'landscape-plaque-style',
    title: '山水玉牌构图',
    form: '山水牌',
    patterns: ['山水纹', '云纹'],
    colors: ['羊脂白玉', '青白玉', '碧玉'],
    image: commonsFile('清 玉雕山水人物圖屏-Table screen with landscape scene MET 14546.jpg'),
    fallbackImage: LOCAL_FALLBACKS.山水牌,
    source: commonsPage('清 玉雕山水人物圖屏-Table screen with landscape scene MET 14546.jpg'),
    instruction: 'Use Image 1 for plaque proportions and shallow relief field; render a literati mountain-water scene on the jade surface.',
  },
]

export const PRESET_PROMPTS = [
  { label: '龙纹玉佩', form: '玉佩', patterns: ['龙纹', '云纹'], color: '青白玉' },
  { label: '谷纹玉璧', form: '玉璧', patterns: ['谷纹', '龙纹'], color: '青玉' },
  { label: '良渚玉琮', form: '玉琮', patterns: ['兽面纹'], color: '青白玉' },
  { label: '白玉如意', form: '玉如意', patterns: ['云纹', '缠枝纹'], color: '羊脂白玉' },
  { label: '红山玉龙', form: '玉龙', patterns: ['龙纹'], color: '碧玉' },
]

export const EXHIBITS = [
  { id: 1, name: 'C 形 玉 龙', era: '红山文化', date: '约公元前 4000-3000 年', material: '岫岩玉 / 青玉', motif: '龙形崇拜', highlight: '从装饰走向礼仪象征', desc: '蜷曲的 C 形身躯展现了先民对龙的想象与崇拜，造型简洁而充满原始力量感，是中国早期玉礼器从佩饰走向信仰象征的重要例证。', audioText: '红山文化C形玉龙，被誉为中华第一龙。', color: '#1A4D3E', image: commonsFile('Neolithic Hongshan Culture Jade Dragon, c. 4000-3000 BC.jpg'), source: commonsPage('Neolithic Hongshan Culture Jade Dragon, c. 4000-3000 BC.jpg') },
  { id: 2, name: '玉 琮', era: '良渚文化', date: '约公元前 3300-2300 年', material: '透闪石玉', motif: '神人兽面纹', highlight: '天圆地方的宇宙观', desc: '良渚玉琮外方内圆，象征秩序化的天地观。器表常见神人兽面纹，是研究早期宗教、王权与玉礼制度的重要物证。', audioText: '良渚文化玉琮，外方内圆，象征天圆地方。', color: '#B8A86A', image: commonsFile('British Museum Chinese jade Neolithic period Liangzhu culture Cong 11022019 1433.jpg'), source: commonsPage('British Museum Chinese jade Neolithic period Liangzhu culture Cong 11022019 1433.jpg') },
  { id: 3, name: '玉 璧', era: '商周至汉', date: '约公元前 1600-公元 220 年', material: '青玉 / 白玉', motif: '谷纹、蒲纹、龙纹', highlight: '祭天与朝聘礼器', desc: '玉璧是玉文化中最重要、延续时间最长的器型之一。圆形中孔象征天，用于祭祀、朝聘、盟誓等重大礼仪场合。', audioText: '玉璧，圆形中孔，常用于祭天与礼仪。', color: '#8A9A8E', image: commonsFile('Jade Bi, British Museum.jpg'), source: commonsPage('Jade Bi, British Museum.jpg') },
  { id: 4, name: '龙 纹 玉 璧', era: '西汉', date: '公元前 202-公元 9 年', material: '青玉', motif: '龙纹、谷纹', highlight: '平面礼器中的动态叙事', desc: '汉代玉璧常以龙纹、谷纹组织出繁密而有秩序的表面。龙纹在圆璧中盘旋回环，使祭礼器形获得更强的动势与权力象征。', audioText: '西汉龙纹玉璧，将礼器形制与龙纹动态结合。', color: '#6F927F', image: commonsFile("Jade Bi Disk with Dragon Design unearthed from the King's tomb at Shizishan Hill.jpg"), source: commonsPage("Jade Bi Disk with Dragon Design unearthed from the King's tomb at Shizishan Hill.jpg") },
  { id: 5, name: '玉 璜', era: '西汉', date: '约公元前 3-1 世纪', material: '玉 / 透闪石玉', motif: '弧形佩饰、龙纹', highlight: '组佩系统中的节奏构件', desc: '玉璜呈弧形，是组佩体系中的重要组成。它既是身体佩戴的装饰，也参与礼仪行走中的声响、秩序与身份表达。', audioText: '西汉玉璜，是组佩系统中的重要构件。', color: '#B8B49C', image: commonsFile('西漢 玉璜-Arc-Shaped Pendant (Huang) MET 269580.jpg'), source: commonsPage('西漢 玉璜-Arc-Shaped Pendant (Huang) MET 269580.jpg') },
  { id: 6, name: '龙 首 玉 佩', era: '东周至西汉', date: '约公元前 700-公元 9 年', material: '玉', motif: '龙首、虎首、云纹', highlight: '佩饰中的动物神性', desc: '此类玉佩常以龙首或虎首作为端部母题，在修长体量中压缩动物形象，体现先秦至汉代佩饰对神兽符号的吸收。', audioText: '龙首玉佩，将动物神性压缩在佩饰结构中。', color: '#A7B5A9', image: commonsFile('British Museum Chinese jade Eastern Zhou or Western Han dynasty Pendant with a dragon or tiger head 11022019 1551.jpg'), source: commonsPage('British Museum Chinese jade Eastern Zhou or Western Han dynasty Pendant with a dragon or tiger head 11022019 1551.jpg') },
  { id: 7, name: '玉 蝉', era: '汉代', date: '公元前 202-公元 220 年', material: '白玉 / 青玉', motif: '蝉形、汉八刀', highlight: '极简刀法与复生寓意', desc: '汉代玉蝉以概括性的刀法塑造蝉形，线条简洁有力。它既是佩饰题材，也进入丧葬用玉系统，承载蝉蜕复生的生命想象。', audioText: '汉代玉蝉，以简洁刀法表达蝉蜕复生。', color: '#DAD4BC', image: commonsFile('Han Jade Burial Cicada.jpg'), source: commonsPage('Han Jade Burial Cicada.jpg') },
  { id: 8, name: '明 代 玉 带 板', era: '明代', date: '约公元 1368-1644 年', material: '白玉 / 青白玉', motif: '花鸟、人物、瑞兽', highlight: '制度服饰中的玉德', desc: '玉带板嵌缀于革带之上，是等级服饰的重要组成。明代玉带板常见花鸟、人物和瑞兽题材，兼具礼制功能与装饰审美。', audioText: '明代玉带板，将玉器纳入服饰等级与审美体系。', color: '#C9C2A6', image: commonsFile('Ming Jade Belt Plaque 08.jpg'), source: commonsPage('Ming Jade Belt Plaque 08.jpg') },
  { id: 9, name: '玉 带 板', era: '明代', date: '15-16 世纪', material: '玉 / 透闪石玉', motif: '镂雕、花鸟', highlight: '小尺度浮雕的精密经营', desc: '带板上的浅浮雕和镂雕把有限面积转化为细密叙事空间，体现明代宫廷与士人审美中对材质、工艺和图像寓意的综合经营。', audioText: '玉带板以小尺度浮雕呈现精密图像。', color: '#E0D7BD', image: commonsFile('MET 10431.jpg'), source: commonsPage('MET 10431.jpg') },
  { id: 10, name: '白 玉 如 意', era: '清代', date: '18 世纪', material: '和田白玉 / 透闪石玉', motif: '灵芝、云纹', highlight: '吉祥语汇的集成', desc: '如意在明清时期成为宫廷与文人空间中的典型陈设。器形取灵芝、祥云之意，将祝愿、赏玩与材料美感凝为一体。', audioText: '清代白玉如意，是吉祥寓意与材质审美的结合。', color: '#F0E7CF', image: commonsFile('清中期 玉如意-Ornament (Ruyi) MET 32834.jpg'), source: commonsPage('清中期 玉如意-Ornament (Ruyi) MET 32834.jpg') },
  { id: 11, name: '兽 面 纹 玉 琮 局 部', era: '良渚文化', date: '约公元前 3300-2300 年', material: '白玉 / 透闪石玉', motif: '神人兽面纹', highlight: '纹样基因的高度凝缩', desc: '兽面纹以细密线刻组织神人、兽面与冠饰，是良渚玉器最具识别度的视觉基因。此处以局部细节展示纹样密度、线刻秩序与礼制图像的高度凝缩。', audioText: '良渚兽面纹，是早期玉礼器的核心视觉基因。', color: '#A9B09D', image: commonsFile('Jade cong from the Liangzhu culture(Neolithic) in Zhejiang Museum(Partial view)2.jpg'), source: commonsPage('Jade cong from the Liangzhu culture(Neolithic) in Zhejiang Museum(Partial view)2.jpg') },
  { id: 12, name: '玉 雕 山 水 屏', era: '清代', date: '约 18-19 世纪', material: '白玉 / 青白玉', motif: '山水、人物、亭台', highlight: '掌中可游的文人景观', desc: '山水题材玉雕将浅浮雕、透雕与画面构图结合，把山水画的空间经营转译为玉石肌理，成为可观、可游、可寄兴的微型文人世界。', audioText: '清代山水玉雕，将山水诗画凝缩在玉石之中。', color: '#7EA38D', image: commonsFile('清 玉雕山水人物圖屏-Table screen with landscape scene MET 14546.jpg'), source: commonsPage('清 玉雕山水人物圖屏-Table screen with landscape scene MET 14546.jpg') },
].map((item) => ({
  ...item,
  fallbackImage: item.fallbackImage || fallbackForExhibit(item.name),
}))

export function pickReferences({ form, patterns = [], color }) {
  const scored = REFERENCE_LIBRARY.map((item) => {
    let score = 0
    if (form && item.form === form) score += 8
    if (color && item.colors.includes(color)) score += 3
    patterns.forEach((pattern) => {
      if (item.patterns.includes(pattern)) score += 2
    })
    return { ...item, score }
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  const primary = scored.filter((item) => form && item.form === form)
  const secondary = scored.filter((item) => !primary.includes(item))
  return [...primary, ...secondary].slice(0, 3)
}
