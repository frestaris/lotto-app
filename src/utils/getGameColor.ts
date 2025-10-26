/**
 * 🎨 Returns a Tailwind color class for a given game slug.
 * Add or adjust colors here globally.
 */
export function getGameColor(slug?: string): string {
  const colorMap: Record<string, string> = {
    "starpick": "text-yellow-400",
    "luckydraw-7": "text-green-400",
    "dreamline-daily": "text-purple-400",
    "weekend-millions": "text-orange-400",
  };

  return slug && colorMap[slug.toLowerCase()]
    ? colorMap[slug.toLowerCase()]
    : "text-yellow-400";
}
