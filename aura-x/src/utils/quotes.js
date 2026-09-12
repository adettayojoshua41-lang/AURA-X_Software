import { todayISO } from "./dateHelpers";

export const QUOTES = [
  "One small study session beats one big excuse.",
  "Progress is progress, no matter how small.",
  "Future you is watching. Make them proud.",
  "Discipline is choosing what you want most over what you want now.",
  "Small steps every day add up to big results.",
  "You don't have to be perfect, just consistent.",
  "Focus on the next 25 minutes, not the whole semester.",
  "Every expert was once a beginner who kept showing up.",
  "Your only competition is who you were yesterday.",
  "Done is better than perfect.",
  "Study smart, rest well, repeat.",
  "The comeback is always stronger than the setback.",
  "A little progress each day adds up to big results.",
  "You are one focused session away from a better week.",
  "Slow progress is still progress.",
  "Consistency beats intensity.",
  "Your future self will thank you for today's effort.",
  "Motivation gets you started, habit keeps you going.",
  "Great things take time, keep going.",
  "Turn your can'ts into cans and your dreams into plans.",
  "Success is the sum of small efforts repeated daily.",
  "Learning never exhausts the mind.",
  "It always seems impossible until it's done.",
  "Push yourself, because no one else is going to do it for you.",
  "Believe you can and you're halfway there.",
  "Don't watch the clock; do what it does. Keep going.",
  "Dream big. Start small. Act now.",
  "The expert in anything was once a beginner.",
  "Your education is a dress rehearsal for a life that is yours to lead.",
  "Focus on being productive instead of busy.",
];

/** Same quote all day, changes at midnight. Seeded by the calendar date. */
export function quoteOfTheDay() {
  const seed = todayISO();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return QUOTES[hash % QUOTES.length];
}
