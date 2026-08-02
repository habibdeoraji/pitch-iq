import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { renderMarkdown } from "./markdown";
import { DocsViewer } from "./docs-viewer";

export const dynamic = "force-dynamic";

export default async function DocsPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const root = process.cwd();
  const output = execFileSync(
    "git",
    [
      "ls-files",
      "--others",
      "--ignored",
      "--exclude-standard",
      "--",
      "*.md",
      ":!node_modules",
      ":!.next",
      ":!.git",
    ],
    { cwd: root, encoding: "utf-8" },
  );
  const files = output.split("\n").filter(Boolean).sort();

  const docs = await Promise.all(
    files.map(async (relPath) => ({
      path: relPath,
      html: await renderMarkdown(
        readFileSync(path.join(/* turbopackIgnore: true */ root, relPath), "utf-8"),
      ),
    })),
  );

  return <DocsViewer docs={docs} />;
}
