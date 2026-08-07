import { Marked } from "marked";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

// Isolated instance (not the shared singleton from `marked`) so this
// renderer's config can't collide with anything else that imports `marked`.
const marked = new Marked({
  renderer: {
    // Model output can contain raw HTML if asked for it; escape rather than
    // pass it through, since this is rendered via dangerouslySetInnerHTML.
    html(token: { raw: string }) {
      return escapeHtml(token.raw);
    },
  },
});

export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false }) as string;
}
