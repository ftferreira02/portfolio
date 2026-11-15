/** "What I'd do next" becomes "what-i-d-do-next". Used for heading ids and the links to them. */
export function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
