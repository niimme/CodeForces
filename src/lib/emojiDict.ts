export interface EmojiMapping {
  emoji: string;
  category: string;
}

export const EMOJI_MAPPING: Record<string, EmojiMapping> = {
  'Watermelon': { emoji: '🍉', category: 'Math / Brute Force' },
  'Way Too Long Words': { emoji: '🔤', category: 'Strings' },
  'Team': { emoji: '👥', category: 'Greedy / Brute Force' },
  'Next Round': { emoji: '🏁', category: 'Conditionals / Arrays' },
  'Bit++': { emoji: '💻', category: 'Implementation' },
  'Domino piling': { emoji: '🁓', category: 'Math / Geometry' },
  'Beautiful Matrix': { emoji: '🔲', category: 'Matrices / Simulation' },
  'Petya and Strings': { emoji: '🔡', category: 'Strings / Comparison' },
  'Boy or Girl': { emoji: '🚻', category: 'Hash Sets / Counting' },
  'Helpful Maths': { emoji: '➕', category: 'Sorting / Strings' },
  'Elephant': { emoji: '🐘', category: 'Math / Greedy' },
  'Word Capitalization': { emoji: '🔠', category: 'Strings' },
  'Bear and Big Brother': { emoji: '🐻', category: 'Loops / Math' },
  'Soldier and Bananas': { emoji: '🍌', category: 'Math / Arithmetic' },
  'Wrong Subtraction': { emoji: '➖', category: 'Simulation / Math' },
  'Nearly Lucky Number': { emoji: '🍀', category: 'Strings / Counting' },
  'Tram': { emoji: '🚋', category: 'Simulation / Greedy' },
  'Anton and Danik': { emoji: '♟️', category: 'Strings / Counting' },
  'Translation': { emoji: '🔄', category: 'Strings / Reversal' },
  'Stones on the Table': { emoji: '💎', category: 'Strings / Greedy' },
  'In Search of an Easy Problem': { emoji: '🔍', category: 'Arrays / Logic' },
  'Vanya and Fence': { emoji: '🚶', category: 'Math / Logic' },
  'Word': { emoji: '📝', category: 'Strings / Case' },
  'Anton and Letters': { emoji: '✉️', category: 'Hash Sets / Strings' },
  'Hulk': { emoji: '💚', category: 'Strings / Alternation' },
  'George and Accommodation': { emoji: '🏠', category: 'Conditionals / Arrays' },
  'Magnets': { emoji: '🧲', category: 'Arrays / Logic' },
  'Calculating Function': { emoji: '🧮', category: 'Math / Parity' },
  'Hit the Lottery': { emoji: '💵', category: 'Greedy / Math' },
  'Divisibility Problem': { emoji: '➗', category: 'Math / Modulo' },
  'Ultra-Fast Mathematician': { emoji: '⚡', category: 'Bitwise / Strings' },
  'Presents': { emoji: '🎁', category: 'Arrays / Permutation' },
  'I Wanna Be the Guy': { emoji: '🎮', category: 'Sets / Arrays' },
  'Drinks': { emoji: '🍹', category: 'Math / Average' },
  'Insomnia cure': { emoji: '🐉', category: 'Math / Divisibility' },
  'Queue at the School': { emoji: '🏫', category: 'Simulation / Strings' },
  'Chat room': { emoji: '💬', category: 'Greedy / Strings' },
  'Lucky Division': { emoji: '🎰', category: 'Brute Force / Math' },
  'Twins': { emoji: '🪙', category: 'Greedy / Sorting' },
  'String Task': { emoji: '✂️', category: 'Strings / Filtering' },
  'Even Odds': { emoji: '⚖️', category: 'Math / Formula' },
  'Football': { emoji: '⚽', category: 'Strings / Sliding Window' },
  'Expression': { emoji: '📐', category: 'Math / Brute Force' },
  'HQ9+': { emoji: '⌨️', category: 'Implementation' },
  'Anton and Polyhedrons': { emoji: '🎲', category: 'Geometry / Hash Map' },
  'Pangram': { emoji: '🔤', category: 'Strings / Alphabet' },
  'Is your horseshoe on the other hoof?': { emoji: '🐎', category: 'Sets / Counting' },
  'Games': { emoji: '🎽', category: 'Brute Force / Arrays' },
  'Buy a Shovel': { emoji: '⛏️', category: 'Math / Brute Force' },
  'Candies and Two Sisters': { emoji: '🍬', category: 'Math / Combinatorics' },
};

export function getEmojiAndCategory(title: string, tags: string[] = []): EmojiMapping {
  // Direct match
  if (EMOJI_MAPPING[title]) {
    return EMOJI_MAPPING[title];
  }

  // Partial match by title keywords
  const titleLower = title.toLowerCase();
  for (const [key, mapping] of Object.entries(EMOJI_MAPPING)) {
    if (titleLower.includes(key.toLowerCase())) {
      return mapping;
    }
  }

  // Fallback by tags
  let category = tags.length > 0 ? tags.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' / ') : 'Implementation';
  let emoji = '💡';

  if (tags.includes('math')) emoji = '🔢';
  else if (tags.includes('strings')) emoji = '🔤';
  else if (tags.includes('greedy')) emoji = '💎';
  else if (tags.includes('brute force')) emoji = '🔨';
  else if (tags.includes('dp')) emoji = '🧩';
  else if (tags.includes('sortings')) emoji = '📊';
  else if (tags.includes('data structures')) emoji = '🗂️';
  else if (tags.includes('geometry')) emoji = '📐';

  return { emoji, category };
}
