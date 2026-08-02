import { marked, type Tokens } from "marked";
import { codeToHtml } from "shiki";

type CodeToken = Tokens.Code & { html?: string };

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

let configured = false;

function configureMarked() {
  if (configured) return;
  configured = true;

  marked.use({
    async: true,
    walkTokens: async (token) => {
      if (token.type !== "code") return;
      const code = token as CodeToken;
      const lang = code.lang?.split(" ")[0] || "text";

      let highlighted: string;
      try {
        highlighted = await codeToHtml(code.text, {
          lang,
          themes: { light: "github-light", dark: "github-dark" },
        });
      } catch {
        highlighted = `<pre class="shiki"><code>${escapeHtml(code.text)}</code></pre>`;
      }

      const label = code.lang?.split(" ")[0] ?? "";
      code.html = [
        '<div class="code-block">',
        '<div class="absolute top-2 right-3 z-10 flex items-center gap-2">',
        label
          ? `<span class="font-mono text-[11px] tracking-wide text-neutral-500 uppercase dark:text-neutral-400">${escapeHtml(label)}</span>`
          : "",
        '<button type="button" data-copy class="rounded-md border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700 transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">Copy</button>',
        "</div>",
        highlighted,
        "</div>",
      ].join("");
    },
    renderer: {
      code(token) {
        const code = token as CodeToken;
        return code.html ?? `<pre><code>${escapeHtml(code.text)}</code></pre>`;
      },
    },
  });
}

export async function renderMarkdown(source: string): Promise<string> {
  configureMarked();
  return marked.parse(source);
}
