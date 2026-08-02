"use client";

import { useEffect, useRef, useState } from "react";

type Doc = { path: string; html: string };

type TreeNode = {
  name: string;
  fullPath: string;
  type: "folder" | "file";
  children: TreeNode[];
  doc?: Doc;
};

function buildTree(docs: Doc[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const doc of docs) {
    const parts = doc.path.split("/");
    let level = root;
    let acc = "";

    parts.forEach((part, i) => {
      acc = acc ? `${acc}/${part}` : part;
      const isFile = i === parts.length - 1;
      let node = level.find((n) => n.name === part);
      if (!node) {
        node = {
          name: part,
          fullPath: acc,
          type: isFile ? "file" : "folder",
          children: [],
          doc: isFile ? doc : undefined,
        };
        level.push(node);
      }
      level = node.children;
    });
  }

  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(root);

  return root;
}

function Tree({
  nodes,
  depth,
  activePath,
  onSelect,
}: {
  nodes: TreeNode[];
  depth: number;
  activePath?: string;
  onSelect: (path: string) => void;
}) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) =>
        node.type === "file" ? (
          <li key={node.fullPath}>
            <button
              onClick={() => onSelect(node.fullPath)}
              style={{ paddingLeft: `${depth * 14 + 12}px` }}
              className={`block w-full truncate rounded-r-md border-l-2 py-1.5 pr-2 text-left text-[13px] transition-colors ${node.fullPath === activePath
                ? "border-blue-600 bg-blue-600/6 font-medium text-blue-700 dark:border-blue-400 dark:bg-blue-400/8 dark:text-blue-300"
                : "border-transparent text-neutral-600 hover:bg-neutral-200/50 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
                }`}
            >
              {node.name}
            </button>
          </li>
        ) : (
          <FolderItem
            key={node.fullPath}
            node={node}
            depth={depth}
            activePath={activePath}
            onSelect={onSelect}
          />
        ),
      )}
    </ul>
  );
}

function FolderItem({
  node,
  depth,
  activePath,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  activePath?: string;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <li>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
        className="flex w-full items-center gap-1.5 rounded-md border-l-2 border-transparent py-1.5 pr-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-200/50 dark:text-neutral-300 dark:hover:bg-neutral-800/50"
      >
        <span
          className={`inline-block w-3 text-neutral-400 transition-transform ${open ? "rotate-90" : ""}`}
        >
          ▸
        </span>
        <span className="truncate">{node.name}</span>
      </button>
      {open && (
        <Tree nodes={node.children} depth={depth + 1} activePath={activePath} onSelect={onSelect} />
      )}
    </li>
  );
}

function handleCopyClick(e: MouseEvent) {
  const button = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-copy]");
  if (!button) return;

  const code = button.closest(".code-block")?.querySelector("pre")?.textContent ?? "";
  navigator.clipboard.writeText(code);

  const original = button.textContent;
  button.textContent = "Copied!";
  setTimeout(() => {
    button.textContent = original;
  }, 1500);
}

export function DocsViewer({ docs }: { docs: Doc[] }) {
  const [activePath, setActivePath] = useState(docs[0]?.path);
  const active = docs.find((d) => d.path === activePath);
  const tree = buildTree(docs);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    container.addEventListener("click", handleCopyClick);
    return () => container.removeEventListener("click", handleCopyClick);
  }, [active?.html]);

  return (
    <div className="flex h-screen bg-white dark:bg-neutral-950">
      <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="border-b border-neutral-200 px-5 py-5 dark:border-neutral-800">
          <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Local Docs
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-400">git-ignored · dev only</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <Tree nodes={tree} depth={0} activePath={activePath} onSelect={setActivePath} />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-10 py-12">
          {active ? (
            <>
              <p className="mb-6 font-mono text-xs text-neutral-400">{active.path}</p>
              <div
                ref={contentRef}
                className="markdown-doc"
                dangerouslySetInnerHTML={{ __html: active.html }}
              />
            </>
          ) : (
            <p className="text-sm text-neutral-500">No git-ignored markdown files found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
