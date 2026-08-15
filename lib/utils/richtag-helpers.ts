/**
 * Shared rich-text tag insertion logic for CodeMirror editors.
 * Used by both NotepadTab and PublishContentTab.
 */

export type RichTagVariant = "note" | "publish";

export function buildTagReplacement(
  tag: string,
  selectedText: string,
  variant: RichTagVariant,
): string | null {
  switch (tag) {
    case "img": {
      const url = prompt("Enter Image URL:");
      if (!url) return null;
      const imgClass =
        variant === "note"
          ? "my-5 rounded-2xl w-full shadow-md border border-gray-100 dark:border-gray-800"
          : "my-6 rounded-2xl w-full shadow-md border border-gray-100 dark:border-gray-800";
      return `<img src="${url}" class="${imgClass}" />`;
    }
    case "b":
      return `<b>${selectedText || "bold text"}</b>`;
    case "i":
      return `<i>${selectedText || "italic text"}</i>`;
    case "link": {
      const url = prompt("Enter Link URL:");
      if (!url) return null;
      return `<a href="${url}" class="text-blue-500 font-bold underline" target="_blank">${selectedText || "Link Text"}</a>`;
    }
    case "h2": {
      const h2Class =
        variant === "note"
          ? "text-2xl font-extrabold mt-7 mb-3 text-gray-900 dark:text-white"
          : "text-2xl font-extrabold text-gray-900 dark:text-white";
      return `<h2 class="${h2Class}">${selectedText || (variant === "note" ? "Heading 2" : "Subheading")}</h2>`;
    }
    case "h3": {
      const h3Class =
        variant === "note"
          ? "text-lg font-bold mt-5 mb-2 text-gray-900 dark:text-white"
          : "text-xl font-bold text-gray-900 dark:text-white";
      return `<h3 class="${h3Class}">${selectedText || "Heading 3"}</h3>`;
    }
    case "code-inline": {
      const codeClass =
        variant === "note"
          ? "bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md text-sm font-mono text-gray-700 dark:text-gray-200"
          : "bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-mono text-gray-700 dark:text-gray-200";
      return `<code class="${codeClass}">${selectedText || "code"}</code>`;
    }
    case "code-block": {
      const language = prompt(
        "Enter programming language (e.g., javascript, python, html):",
      );
      const preClass =
        variant === "note"
          ? "bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-5 shadow-md"
          : "bg-gray-900 text-gray-100 rounded-xl overflow-x-auto shadow-md";
      return `<pre class="${preClass}"><code class="language-${language || "text"}">${selectedText || "// Your code here\nconsole.log('Hello World!');"}</code></pre>`;
    }
    case "iframe": {
      const url = prompt("Enter iframe URL (YouTube, CodePen, etc.):");
      if (!url) return null;
      return `<iframe src="${url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="width:100%;height:auto;aspect-ratio:16 / 9"></iframe>`;
    }
    case "list": {
      const ulClass =
        variant === "note"
          ? "list-disc pl-6 my-4 space-y-1"
          : "list-disc space-y-1";
      return `<ul class="${ulClass}">\n  <li>${selectedText || "List item 1"}</li>\n  <li>List item 2</li>\n  <li>List item 3</li>\n</ul>`;
    }
    case "latex-inline":
      return `\(${selectedText || "a^2+b^2=c^2"}\)`;
    case "latex-block": {
      const defaultLatex =
        variant === "note"
          ? "\sum_{i=1}^{n} i = \frac{n(n+1)}{2}"
          : "\int_0^1 x^2\,dx = \frac{1}{3}";
      return `\[\n${selectedText || defaultLatex}\n\]`;
    }
    case "quote":
      return `<blockquote class="border-l-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/30 italic text-gray-700 dark:text-gray-300 rounded-r-lg">${selectedText || "Insert your quote here"}</blockquote>`;
    case "table":
      return `<div class="overflow-x-auto my-5 rounded-xl border border-gray-200 dark:border-gray-700">
  <table class="min-w-full bg-white dark:bg-gray-800">
    <thead class="bg-gray-50 dark:bg-gray-700/70">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Header 1</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Header 2</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Data 1</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Data 2</td>
      </tr>
    </tbody>
  </table>
</div>`;
    case "divider":
      return `<hr class="my-6 border-t border-gray-200 dark:border-gray-700" />`;
    case "alert": {
      const type =
        prompt("Enter alert type (success, warning, error, info):") || "info";
      const colors: Record<string, string> = {
        success:
          "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300",
        warning:
          "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300",
        error:
          "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300",
        info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300",
      };
      return `<div class="p-4 my-4 border rounded-lg ${colors[type] || colors.info}">${selectedText || "Alert message here"}</div>`;
    }
    default:
      return null;
  }
}

/**
 * Inserts a tag into a CodeMirror editor view.
 * Call this from the toolbar's onInsert callback.
 */
export function insertTagIntoEditor(
  view: any,
  tag: string,
  variant: RichTagVariant,
): void {
  if (!view) return;

  const selection = view.state.selection.main;
  const start = selection.from;
  const end = selection.to;
  const selectedText = view.state.sliceDoc(start, end);

  const replacement = buildTagReplacement(tag, selectedText, variant);
  if (!replacement) return;

  view.dispatch({
    changes: { from: start, to: end, insert: replacement },
    selection: { anchor: start + replacement.length },
  });
  view.focus();
}
