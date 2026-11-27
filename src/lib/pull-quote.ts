// Splits a story's rendered body after its Nth top-level paragraph, so the page can
// put the pull quote there. Paragraphs inside lists, quotes or tables don't count.
// If the story is short, the split moves up so at least one paragraph follows.
// Returns null when there is nowhere sensible to put it.

const CONTAINERS = new Set(['blockquote', 'ul', 'ol', 'li', 'table', 'figure', 'div', 'aside', 'section', 'details']);

export function splitAfterParagraph(html: string, wanted = 2): [string, string] | null {
  const ends: number[] = [];
  let depth = 0;
  const tag = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(html))) {
    const closing = m[1] === '/';
    const name = m[2].toLowerCase();
    if (CONTAINERS.has(name)) depth += closing ? -1 : 1;
    else if (name === 'p' && closing && depth === 0) ends.push(tag.lastIndex);
  }
  if (ends.length < 2) return null;
  const n = Math.min(Math.max(1, Math.round(wanted) || 2), 6, ends.length - 1);
  const at = ends[n - 1];
  return [html.slice(0, at), html.slice(at)];
}
