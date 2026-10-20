"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { tokenizeMarkdown, type MarkdownToken } from "@/lib/markdown-lite";

/**
 * Renderer markdown ringan untuk balasan asisten chat — wrapper React
 * dari tokenizeMarkdown() (logika parse ada di src/lib/markdown-lite.ts).
 *
 * Baris baru & spasi dipertahankan oleh whitespace-pre-wrap pada bubble induk.
 */

const LINK_CLS =
  "text-blue-600 underline underline-offset-2 break-all transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300";
const CODE_CLS =
  "rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-700 dark:bg-slate-800 dark:text-slate-300";

function renderToken(token: MarkdownToken, key: number): ReactNode {
  switch (token.type) {
    case "text":
      return <span key={key}>{token.value}</span>;
    case "bold":
      return (
        <strong key={key} className="font-semibold">
          {token.value}
        </strong>
      );
    case "code":
      if (token.href) {
        return (
          <Link
            key={key}
            href={token.href}
            className={`${CODE_CLS} underline underline-offset-2 transition-colors hover:text-blue-600`}
          >
            {token.value}
          </Link>
        );
      }
      return (
        <code key={key} className={CODE_CLS}>
          {token.value}
        </code>
      );
    case "link": {
      if (token.href.startsWith("/")) {
        return (
          <Link key={key} href={token.href} className={LINK_CLS}>
            {token.label}
          </Link>
        );
      }
      return (
        <a
          key={key}
          href={token.href}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLS}
        >
          {token.label}
        </a>
      );
    }
  }
}

export function MarkdownLite({ text }: { text: string }) {
  return <>{tokenizeMarkdown(text).map(renderToken)}</>;
}
