export interface FontOption {
  name: string;
  category: 'sans' | 'serif' | 'play';
  fallback: string;
  previewText?: string;
}

export const APP_FONTS: FontOption[] = [
  // --- Sans-Serif Fonts (20) ---
  { name: 'Inter', category: 'sans', fallback: 'sans-serif', previewText: 'Clean modern precision' },
  { name: 'Plus Jakarta Sans', category: 'sans', fallback: 'sans-serif', previewText: 'Sleek geometric clarity' },
  { name: 'Outfit', category: 'sans', fallback: 'sans-serif', previewText: 'Refined contemporary rhythm' },
  { name: 'Montserrat', category: 'sans', fallback: 'sans-serif', previewText: 'Classic architectural bold' },
  { name: 'Poppins', category: 'sans', fallback: 'sans-serif', previewText: 'Friendly balanced geometry' },
  { name: 'Roboto', category: 'sans', fallback: 'sans-serif', previewText: 'Industrial functional neutral' },
  { name: 'Open Sans', category: 'sans', fallback: 'sans-serif', previewText: 'Highly legible humanist' },
  { name: 'Lato', category: 'sans', fallback: 'sans-serif', previewText: 'Warm approachable sans' },
  { name: 'Raleway', category: 'sans', fallback: 'sans-serif', previewText: 'Elegant refined display' },
  { name: 'Nunito', category: 'sans', fallback: 'sans-serif', previewText: 'Rounded balanced curves' },
  { name: 'Work Sans', category: 'sans', fallback: 'sans-serif', previewText: 'Optimized screen reading' },
  { name: 'DM Sans', category: 'sans', fallback: 'sans-serif', previewText: 'Modern low-contrast sans' },
  { name: 'Rubik', category: 'sans', fallback: 'sans-serif', previewText: 'Gentle rounded angles' },
  { name: 'Sora', category: 'sans', fallback: 'sans-serif', previewText: 'High-tech digital display' },
  { name: 'Manrope', category: 'sans', fallback: 'sans-serif', previewText: 'Modern semi-grotesque' },
  { name: 'Lexend', category: 'sans', fallback: 'sans-serif', previewText: 'Engineered reading fluency' },
  { name: 'Figtree', category: 'sans', fallback: 'sans-serif', previewText: 'Crisp nimble UI font' },
  { name: 'Urbanist', category: 'sans', fallback: 'sans-serif', previewText: 'Geometric low-contrast' },
  { name: 'Cabin', category: 'sans', fallback: 'sans-serif', previewText: 'Humanist proportions' },
  { name: 'Quicksand', category: 'sans', fallback: 'sans-serif', previewText: 'Soft geometric styling' },

  // --- Serif Fonts (16) ---
  { name: 'Playfair Display', category: 'serif', fallback: 'serif', previewText: 'High-contrast luxury editorial' },
  { name: 'Merriweather', category: 'serif', fallback: 'serif', previewText: 'Sturdy screen readability' },
  { name: 'Lora', category: 'serif', fallback: 'serif', previewText: 'Contemporary literary serif' },
  { name: 'Cormorant Garamond', category: 'serif', fallback: 'serif', previewText: 'Traditional regal elegance' },
  { name: 'Cinzel', category: 'serif', fallback: 'serif', previewText: 'Roman stone inscriptions' },
  { name: 'PT Serif', category: 'serif', fallback: 'serif', previewText: 'Universal balanced serif' },
  { name: 'EB Garamond', category: 'serif', fallback: 'serif', previewText: 'Renaissance classical masterpiece' },
  { name: 'Bitter', category: 'serif', fallback: 'serif', previewText: 'Slab serif precision' },
  { name: 'Crimson Text', category: 'serif', fallback: 'serif', previewText: 'Bookish scholarly elegance' },
  { name: 'Libre Baskerville', category: 'serif', fallback: 'serif', previewText: 'Heritage 18th century classic' },
  { name: 'Spectral', category: 'serif', fallback: 'serif', previewText: 'Crisp editorial body serif' },
  { name: 'DM Serif Display', category: 'serif', fallback: 'serif', previewText: 'High-impact editorial headlines' },
  { name: 'Arvo', category: 'serif', fallback: 'serif', previewText: 'Geometric slab serif' },
  { name: 'Bodoni Moda', category: 'serif', fallback: 'serif', previewText: 'Italian couture fashion serif' },
  { name: 'Castoro', category: 'serif', fallback: 'serif', previewText: 'Academic scholarly serif' },
  { name: 'Prata', category: 'serif', fallback: 'serif', previewText: 'Teardrop terminal refinement' },

  // --- Play / Display / Mono Fonts (18) ---
  { name: 'Space Grotesk', category: 'play', fallback: 'sans-serif', previewText: 'Futuristic technical aesthetic' },
  { name: 'Syne', category: 'play', fallback: 'sans-serif', previewText: 'Experimental avant-garde' },
  { name: 'Righteous', category: 'play', fallback: 'cursive', previewText: 'Retro deco typography' },
  { name: 'Bungee', category: 'play', fallback: 'sans-serif', previewText: 'Heavy vertical signage' },
  { name: 'Fredoka', category: 'play', fallback: 'sans-serif', previewText: 'Playful bouncy curves' },
  { name: 'Orbitron', category: 'play', fallback: 'sans-serif', previewText: 'Sci-Fi telemetry cockpit' },
  { name: 'Comfortaa', category: 'play', fallback: 'cursive', previewText: 'Ultra-smooth rounded minimalist' },
  { name: 'Pacifico', category: 'play', fallback: 'cursive', previewText: 'Surf brush calligraphy' },
  { name: 'Caveat', category: 'play', fallback: 'cursive', previewText: 'Expressive handwritten notes' },
  { name: 'Dancing Script', category: 'play', fallback: 'cursive', previewText: 'Flowing cursive script' },
  { name: 'Permanent Marker', category: 'play', fallback: 'cursive', previewText: 'Bold graffiti marker' },
  { name: 'JetBrains Mono', category: 'play', fallback: 'monospace', previewText: 'Developer code monospace' },
  { name: 'Fira Code', category: 'play', fallback: 'monospace', previewText: 'Programmer ligature mono' },
  { name: 'Space Mono', category: 'play', fallback: 'monospace', previewText: 'Retro mechanical terminal' },
  { name: 'Share Tech Mono', category: 'play', fallback: 'monospace', previewText: 'Avionics instrument console' },
  { name: 'Russo One', category: 'play', fallback: 'sans-serif', previewText: 'Punchy heavy headline' },
  { name: 'Bangers', category: 'play', fallback: 'cursive', previewText: 'Comic action display' },
  { name: 'Audiowide', category: 'play', fallback: 'cursive', previewText: 'Synthwave cyber electronic' },
];

/**
 * Dynamically loads and activates a font in the browser
 */
export function applyAppFont(fontName: string): void {
  if (!fontName) return;

  const font = APP_FONTS.find((f) => f.name.toLowerCase() === fontName.toLowerCase()) || {
    name: fontName,
    category: 'sans',
    fallback: 'sans-serif',
  };

  const linkId = `google-font-${font.name.replace(/\s+/g, '-').toLowerCase()}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    const familyParam = font.name.replace(/\s+/g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
  }

  document.documentElement.style.setProperty('--app-font-family', `"${font.name}", ${font.fallback}`);
  document.body.style.fontFamily = `"${font.name}", ${font.fallback}`;
}
