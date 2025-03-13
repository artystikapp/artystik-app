import {
  Playfair_Display,
  Manrope,
  IBM_Plex_Mono,
  Satisfy,
} from "next/font/google";

// brand/display font (for headers, featured text)
export const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// headers, body text font (for general content)
export const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// monospace font (for prices, technical info)
export const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
});

// special headings, quotes, etc.
export const calligraphy = Satisfy({
  variable: "--font-calligraphy",
  subsets: ["latin"],
  weight: ["400"],
});
