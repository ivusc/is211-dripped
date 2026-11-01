// Seed data for the prototype. Everything mirrors the content in the Figma file.
// Caleb's scenario: 19 items are seeded, and he scans the last 2 (SCANNED) during setup, making 21.
// Events sync in from his iPhone calendar, including Friday's career fair session.

export type Category = 'Tops' | 'Bottoms' | 'Shoes';

export type Item = {
  id: string;
  name: string;
  category: Category;
  kind: string;
  material: string;
  colour: string;
  wash?: boolean;
  iron?: boolean;
  issue?: string;
  flaw?: string; // what the scan spotted, e.g. "Small hole on the back"
  lastWorn: string;
  condition: 'Brand new' | 'Lightly used' | 'Well worn';
  tags: string[];
};

export type Event = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  dressCode: string;
  location?: string;
  optional?: boolean;
  outfit?: string[];
  synced?: boolean; // came from the phone's calendar, not added in the app
};

export type Look = { id: string; name: string; avatar: number; pieces: string[] };

export const ART: Record<string, number> = {
  'navy-polo': require('../assets/garments/navy-polo.svg'),
  'white-tshirt': require('../assets/garments/white-tshirt.svg'),
  'light-blue-shirt': require('../assets/garments/light-blue-shirt.svg'),
  'grey-hoodie': require('../assets/garments/grey-hoodie.svg'),
  'denim-jacket': require('../assets/garments/denim-jacket.svg'),
  'white-shirt': require('../assets/garments/white-shirt.svg'),
  'navy-shirt': require('../assets/garments/navy-shirt.svg'),
  'orientation-tee': require('../assets/garments/orientation-tee.svg'),
  'cream-knit': require('../assets/garments/cream-knit.svg'),
  'olive-overshirt': require('../assets/garments/olive-overshirt.svg'),
  'striped-shirt': require('../assets/garments/striped-shirt.svg'),
  'green-polo': require('../assets/garments/green-polo.svg'),
  'beige-pants': require('../assets/garments/beige-pants.svg'),
  'black-jeans': require('../assets/garments/black-jeans.svg'),
  'black-pants': require('../assets/garments/black-pants.svg'),
  'khaki-chinos': require('../assets/garments/khaki-chinos.svg'),
  'navy-chinos': require('../assets/garments/navy-chinos.svg'),
  'grey-pants': require('../assets/garments/grey-pants.svg'),
  'black-leather-shoes': require('../assets/garments/black-leather-shoes.svg'),
  'white-sneakers': require('../assets/garments/white-sneakers.svg'),
  'dark-derbies': require('../assets/garments/dark-derbies.svg'),
  'brown-boots': require('../assets/garments/brown-boots.svg'),
};

export const AVATAR = {
  previewNavy: require('../assets/avatars/preview-navy-polo.svg'),
  previewWhiteTee: require('../assets/avatars/preview-white-tee.svg'),
  previewLightBlue: require('../assets/avatars/preview-light-blue.svg'),
  previewGreen: require('../assets/avatars/preview-green.svg'),
  previewHoodie: require('../assets/avatars/preview-grey-hoodie.svg'),
  previewNavyBeige: require('../assets/avatars/preview-navy-beige.svg'),
  previewTeeBeige: require('../assets/avatars/preview-tee-beige.svg'),
  previewShirtBeige: require('../assets/avatars/preview-shirt-beige.svg'),
  careerBlack: require('../assets/avatars/career-black-shoes.svg'),
  careerBrown: require('../assets/avatars/career-brown-shoes.svg'),
  look1: require('../assets/avatars/look-1.svg'),
  look2: require('../assets/avatars/look-2.svg'),
  look3: require('../assets/avatars/look-3.svg'),
  new1: require('../assets/avatars/look-new-1.svg'),
  new2: require('../assets/avatars/look-new-2.svg'),
  new3: require('../assets/avatars/look-new-3.svg'),
  wedding: require('../assets/avatars/drip-wedding.svg'),
  pitch: require('../assets/avatars/drip-pitch.svg'),
  lecture: require('../assets/avatars/drip-lecture.svg'),
  dinner: require('../assets/avatars/drip-dinner.svg'),
  deck1: require('../assets/avatars/deck-1.svg'),
  deck2: require('../assets/avatars/deck-2.svg'),
  deck3: require('../assets/avatars/deck-3.svg'),
};

const item = (
  id: string,
  name: string,
  category: Category,
  kind: string,
  extra: Partial<Item> = {},
): Item => ({
  id,
  name,
  category,
  kind,
  material: 'Cotton',
  colour: name.split(' ')[0],
  lastWorn: '5 Jan · Lecture',
  condition: 'Lightly used',
  tags: ['Smart casual', 'Casual'],
  ...extra,
});

export const SEED_ITEMS: Item[] = [
  item('navy-polo', 'Navy polo shirt', 'Tops', 'Polo', { colour: 'Navy', lastWorn: '10 Jan · Lecture', tags: ['Smart casual', 'Casual', 'Basics'] }),
  item('white-tshirt', 'White T-shirt', 'Tops', 'T-shirt', { tags: ['Casual', 'Campus'] }),
  item('light-blue-shirt', 'Light blue shirt', 'Tops', 'Shirt', { colour: 'Light blue', tags: ['Smart casual', 'Formal'] }),
  item('grey-hoodie', 'Grey hoodie', 'Tops', 'Hoodie', { tags: ['Casual', 'Campus'] }),
  item('denim-jacket', 'Denim jacket', 'Tops', 'Jacket', { material: 'Denim', colour: 'Blue', tags: ['Casual'] }),
  item('white-shirt', 'White dress shirt', 'Tops', 'Dress shirt', { material: 'Poly cotton', lastWorn: '20 Dec · Wedding', tags: ['Formal', 'Smart casual'] }),
  item('cream-knit', 'Cream knit', 'Tops', 'Sweater', { material: 'Wool', wash: true, iron: true, tags: ['Smart casual'] }),
  item('olive-overshirt', 'Olive overshirt', 'Tops', 'Overshirt', { iron: true, tags: ['Casual'] }),
  item('striped-shirt', 'Striped shirt', 'Tops', 'Shirt', { colour: 'Blue', iron: true, tags: ['Smart casual'] }),
  item('green-polo', 'Green polo', 'Tops', 'Polo', { wash: true, tags: ['Casual', 'Campus'] }),
  item('beige-pants', 'Beige long pants', 'Bottoms', 'Trousers', { tags: ['Smart casual', 'Formal'] }),
  item('black-jeans', 'Black jeans', 'Bottoms', 'Jeans', { material: 'Denim', tags: ['Casual'] }),
  item('black-pants', 'Black long pants', 'Bottoms', 'Trousers', { iron: true, lastWorn: '5 Jan · Lecture', tags: ['Smart casual', 'Formal'] }),
  item('khaki-chinos', 'Khaki chinos', 'Bottoms', 'Chinos', { iron: true, tags: ['Smart casual'] }),
  item('navy-chinos', 'Navy chinos', 'Bottoms', 'Chinos', { iron: true, tags: ['Smart casual'] }),
  item('grey-pants', 'Grey long pants', 'Bottoms', 'Trousers', { wash: true, lastWorn: '20 Dec · Wedding', tags: ['Formal'] }),
  item('black-leather-shoes', 'Black leather shoes', 'Shoes', 'Shoes', { material: 'Leather', tags: ['Smart casual', 'Formal'] }),
  item('white-sneakers', 'White sneakers', 'Shoes', 'Sneakers', { material: 'Canvas', wash: true, lastWorn: '10 Jan · Campus', tags: ['Casual', 'Campus'] }),
  item('brown-boots', 'Brown leather shoes', 'Shoes', 'Shoes', { material: 'Leather', colour: 'Brown', tags: ['Smart casual'] }),
];

// Scanned in order during setup. The tee's first front photo comes out too dark; the shirt has a stain the scan circles.
export type Scan = Item & { dark?: boolean; spot?: { shot: number; x: number; y: number; mark: string } };
export const SCANNED: Scan[] = [
  {
    ...item('orientation-tee', 'School tee', 'Tops', 'T-shirt', { colour: 'Orange', lastWorn: '9 Jan · Campus', tags: ['Campus', 'Casual'] }),
    dark: true,
  },
  {
    ...item('navy-shirt', 'Navy dress shirt', 'Tops', 'Dress shirt', { colour: 'Navy', material: 'Poly cotton', lastWorn: '28 Jun 2025 · Graduation', tags: ['Formal', 'Smart casual'] }),
    issue: 'Stained', flaw: 'Yellow stain on the collar', spot: { shot: 0, x: 0.5, y: 0.26, mark: '#E2BF45' },
  },
];

// Pieces in other students' looks that Caleb doesn't own.
const ELSEWHERE: Item[] = [item('dark-derbies', 'Dark brown derby shoes', 'Shoes', 'Shoes', { material: 'Leather', colour: 'Dark brown', tags: ['Smart casual'] })];
export const CATALOG = [...SEED_ITEMS, ...SCANNED, ...ELSEWHERE];

export const SEED_EVENTS: Event[] = [
  { id: 'pres', title: 'Group presentation', date: '2026-01-09', time: '3:00 – 4:00 PM', dressCode: 'Smart casual', outfit: ['navy-polo', 'black-pants', 'black-leather-shoes'], synced: true },
  { id: 'is211', title: 'IS211 consultation', date: '2026-01-15', time: '10:00 – 10:30 AM', dressCode: 'No dress code', optional: true, synced: true },
  { id: 'career', title: 'Career fair networking session', date: '2026-01-16', time: '3:00 PM', dressCode: 'Smart casual', synced: true },
  { id: 'client', title: 'Client project meeting', date: '2026-01-21', time: '2:00 – 3:00 PM', dressCode: 'Smart casual', outfit: ['light-blue-shirt', 'beige-pants', 'brown-boots'], synced: true },
  { id: 'dinner', title: 'Dinner & dance', date: '2026-01-27', time: '7:00 – 10:00 PM', dressCode: 'Formal', synced: true },
];

// Two rounds of generated looks; "New looks" alternates between them.
export const LOOK_ROUNDS: Look[][] = [
  [
    { id: 'l1', name: 'Smart casual', avatar: AVATAR.look1, pieces: ['navy-polo', 'black-pants', 'black-leather-shoes'] },
    { id: 'l2', name: 'Light and sharp', avatar: AVATAR.look2, pieces: ['light-blue-shirt', 'beige-pants', 'brown-boots'] },
    { id: 'l3', name: 'Soft knit', avatar: AVATAR.look3, pieces: ['cream-knit', 'grey-pants', 'black-leather-shoes'] },
  ],
  [
    { id: 'n1', name: 'Relaxed layers', avatar: AVATAR.new1, pieces: ['grey-hoodie', 'navy-chinos', 'brown-boots'] },
    { id: 'n2', name: 'Olive and black', avatar: AVATAR.new2, pieces: ['olive-overshirt', 'black-pants', 'black-leather-shoes'] },
    { id: 'n3', name: 'Denim day', avatar: AVATAR.new3, pieces: ['denim-jacket', 'beige-pants', 'white-sneakers'] },
  ],
];

export type Drip = Look & { date: string; short: string; tag: string; event: string; liked: boolean };

export const DRIPS: Drip[] = [
  { id: 'wedding', name: 'Cousin’s wedding', avatar: AVATAR.wedding, pieces: ['white-shirt', 'grey-pants', 'brown-boots'], date: 'Sat 20 Dec 2025', short: '20 Dec 2025', tag: 'Formal', event: 'Cousin’s wedding · 6:30 PM', liked: true },
  { id: 'pitch', name: 'Project pitch', avatar: AVATAR.pitch, pieces: ['navy-polo', 'black-pants', 'black-leather-shoes'], date: 'Fri 28 Nov 2025', short: '28 Nov 2025', tag: 'Smart casual', event: 'IS211 project pitch · 2:00 PM', liked: false },
  { id: 'lecture', name: 'Lecture day', avatar: AVATAR.lecture, pieces: ['white-tshirt', 'beige-pants', 'white-sneakers'], date: 'Mon 5 Jan', short: '5 Jan', tag: 'Casual', event: 'No event · worn to class', liked: false },
  { id: 'dinner', name: 'Family dinner', avatar: AVATAR.dinner, pieces: ['light-blue-shirt', 'beige-pants', 'black-leather-shoes'], date: 'Thu 1 Jan', short: '1 Jan', tag: 'Casual', event: 'Family dinner · 7:00 PM', liked: true },
];

export type DeckLook = Look & { tags: string[] };

export const DECK: DeckLook[] = [
  { id: 'd1', name: 'Career fair ready', avatar: AVATAR.deck1, pieces: ['white-shirt', 'beige-pants', 'dark-derbies'], tags: ['Smart casual', 'Career fair', 'Posted by @jiahui'] },
  { id: 'd2', name: 'Clean basics', avatar: AVATAR.deck2, pieces: ['white-tshirt', 'khaki-chinos', 'black-leather-shoes'], tags: ['Simple', 'Neat', 'Lecture-ready'] },
  { id: 'd3', name: 'Smart layers', avatar: AVATAR.deck3, pieces: ['navy-polo', 'beige-pants', 'brown-boots'], tags: ['Smart casual', 'Interview', 'Cool weather'] },
];

// Known full-outfit renders (from Figma). Any other combination is drawn from the pieces' colours by dressed().
// Down to Dress renders are left out: they show other students' clothes, not Caleb's.
const RENDERS: [string[], number][] = [
  [['light-blue-shirt', 'beige-pants', 'black-leather-shoes'], AVATAR.careerBlack],
  [['light-blue-shirt', 'beige-pants', 'brown-boots'], AVATAR.careerBrown],
  [['navy-polo', 'beige-pants', 'black-leather-shoes'], AVATAR.previewNavyBeige],
  [['white-tshirt', 'beige-pants', 'black-leather-shoes'], AVATAR.previewTeeBeige],
  [['white-shirt', 'beige-pants', 'black-leather-shoes'], AVATAR.previewShirtBeige],
  ...LOOK_ROUNDS.flat().map((l) => [l.pieces, l.avatar] as [string[], number]),
  ...DRIPS.map((d) => [d.pieces, d.avatar] as [string[], number]),
];

// Each garment's colour, matching its artwork in assets/garments.
const FILL: Record<string, string> = {
  'beige-pants': '#D8C3A0',
  'black-jeans': '#23262B',
  'black-leather-shoes': '#111111',
  'black-pants': '#2A2D33',
  'brown-boots': '#6B4226',
  'cream-knit': '#EDE6D6',
  'dark-derbies': '#3B2A20',
  'denim-jacket': '#4A6A92',
  'green-polo': '#2E8B72',
  'grey-hoodie': '#9BA1AA',
  'grey-pants': '#8E8E93',
  'khaki-chinos': '#A89F7A',
  'light-blue-shirt': '#BFD3EE',
  'navy-chinos': '#2C3E66',
  'navy-polo': '#1F2A44',
  'navy-shirt': '#243352',
  'olive-overshirt': '#6B7A4A',
  'orientation-tee': '#E9A23B',
  'striped-shirt': '#C9D6E8',
  'white-shirt': '#F5F5F2',
  'white-sneakers': '#F4F4F2',
  'white-tshirt': '#FFFFFF',
};

// The avatar figure from the Figma renders, with the top, trousers and shoes filled in from the chosen pieces.
// ponytail: one silhouette for every top; collared tops just get a placket line. Add per-kind shapes if testers notice.
export function dressed(pieces: string[]): string {
  const [top, bottom, shoes] = pieces.map((id) => id.replace(/-\d+$/, ''));
  const fill = (id: string, fallback: string) => FILL[id] ?? fallback;
  const t = fill(top, '#FFFFFF');
  const light = parseInt(t.slice(1, 3), 16) + parseInt(t.slice(3, 5), 16) + parseInt(t.slice(5, 7), 16) > 600;
  const kind = CATALOG.find((i) => i.id === top)?.kind ?? '';
  const collar = /^(Polo|Shirt|Overshirt)$/.test(kind);
  const polo = kind === 'Polo'; // flat collar and a short two-button placket, to match the polo icons
  const dress = kind === 'Dress shirt'; // pointed collar and buttons, to match preview-shirt-beige.svg
  const detail = light ? 'stroke="#1C1C1E" stroke-opacity="0.5"' : 'stroke="white" stroke-opacity="0.55"';
  const flap = light ? 'stroke="#1C1C1E"' : detail;
  const line = 'stroke-width="0.852632" stroke-linejoin="round" stroke="#1C1C1E"';
  return `<svg width="114" height="270" viewBox="0 0 114 270" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M57 264.316C81.33 264.316 101.053 261.771 101.053 258.632C101.053 255.492 81.33 252.947 57 252.947C32.67 252.947 12.947 255.492 12.947 258.632C12.947 261.771 32.67 264.316 57 264.316Z" fill="black" fill-opacity="0.06"/>
<circle cx="57" cy="28.42" r="18.47" fill="#D1D1D6"/>
<path d="M62.684 44.053H51.316V54H62.684Z" fill="#D1D1D6"/>
<circle cx="19.34" cy="115.1" r="5.68" fill="#D1D1D6"/>
<circle cx="94.66" cy="115.1" r="5.68" fill="#D1D1D6"/>
<path d="M31.421 56.842C48.474 52.105 65.526 52.105 82.579 56.842L96.79 106.579L84 110.842L79.737 85.263V140.684H34.263V85.263L30 110.842L17.21 106.579L31.421 56.842Z" fill="${t}" ${line}/>
${collar && !polo ? `<path d="M47.053 54L57 66.79L66.947 54" stroke-width="2.13" stroke="${light ? '#8E8E93' : 'white'}" stroke-opacity="${light ? 0.8 : 0.35}"/>` : ''}
${polo ? `<path d="M55 61H59V78H55Z" fill="${t}" stroke-width="0.7" ${detail}/><circle cx="57" cy="67" r="1.1" fill="${light ? '#1C1C1E' : 'white'}" fill-opacity="0.6"/><circle cx="57" cy="73" r="1.1" fill="${light ? '#1C1C1E' : 'white'}" fill-opacity="0.6"/><path d="M47 54L57 61L51.5 66Q48 62 47 54Z" fill="${t}" stroke-width="0.85" stroke-linejoin="round" ${flap}/><path d="M67 54L57 61L62.5 66Q66 62 67 54Z" fill="${t}" stroke-width="0.85" stroke-linejoin="round" ${flap}/>` : ''}
${dress ? `<path d="M57 140V65" stroke-width="0.7" ${detail}/>${[80, 97, 114, 131].map((y) => `<circle cx="57" cy="${y}" r="1.1" fill="${light ? '#1C1C1E' : 'white'}" fill-opacity="0.5"/>`).join('')}<path d="M46.5 53.6L57 65L50.5 66.5Z" fill="${t}" stroke-width="0.85" stroke-linejoin="round" ${flap}/><path d="M67.5 53.6L57 65L63.5 66.5Z" fill="${t}" stroke-width="0.85" stroke-linejoin="round" ${flap}/>` : ''}
<path d="M34.263 139.263H79.737L78.316 241.579H61.263L57 164.842L52.737 241.579H35.684L34.263 139.263Z" fill="${fill(bottom, '#2A2D33')}" ${line}/>
<path d="M32.842 241.579H54.158V248.684C54.158 251.526 52.737 252.947 49.895 252.947H27.158C27.158 248.211 29.053 244.421 32.842 241.579Z" fill="${fill(shoes, '#111111')}" stroke-width="0.71" stroke="#1C1C1E"/>
<path d="M59.842 241.579H81.158C84.947 244.421 86.842 248.211 86.842 252.947H64.105C61.263 252.947 59.842 251.526 59.842 248.684V241.579Z" fill="${fill(shoes, '#111111')}" stroke-width="0.71" stroke="#1C1C1E"/>
</svg>`;
}

export function avatarFor(pieces: string[]): number | string {
  const hit = RENDERS.find(([p]) => p.length === pieces.length && p.every((x) => pieces.includes(x)));
  return hit ? hit[1] : dressed(pieces);
}

// Fixed "today" so the prototype content (Mon 12 Jan 2026) always lines up.
export const TODAY = '2026-01-12';

export const CHATS = [
  { title: 'Something cool for a 32°C day', when: 'Yesterday' },
  { title: 'Group presentation look', when: '9 Jan' },
  { title: 'Family dinner outfit', when: '1 Jan' },
  { title: 'Is this OK for a wedding?', when: '18 Dec' },
  { title: 'Project pitch, smart casual', when: '28 Nov' },
];
