"use client";

import React from "react";
import {
  Code2,
  Maximize2,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  Quote,
  Table,
  AlertTriangle,
  Minus,
} from "lucide-react";

interface RichTextToolbarProps {
  onInsert: (tag: string) => void;
  variant?: "publish" | "note";
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  onInsert,
  variant = "publish",
}) => {
  const btnClass =
    "w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] font-black shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800";

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-900/60 dark:border-gray-700">
      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => onInsert("h2")}
        className={btnClass}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => onInsert("h3")}
        className={btnClass}
        title="Heading 3"
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => onInsert("b")}
        className={btnClass}
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => onInsert("i")}
        className={`${btnClass} italic font-serif`}
        title="Italic"
      >
        I
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-300 self-center mx-1 dark:bg-gray-700" />

      {/* Code and Embeds */}
      <button
        type="button"
        onClick={() => onInsert("code-inline")}
        className={`${btnClass} font-mono`}
        title="Inline Code"
      >
        &lt;/&gt;
      </button>
      <button
        type="button"
        onClick={() => onInsert("code-block")}
        className={btnClass}
        title="Code Block"
      >
        <Code2 className="w-4 h-4 mx-auto" />
      </button>
      <button
        type="button"
        onClick={() => onInsert("latex-inline")}
        className={`${btnClass} text-[10px]`}
        title="Inline LaTeX"
      >
        fx
      </button>
      <button
        type="button"
        onClick={() => onInsert("latex-block")}
        className={`${btnClass} text-[10px]`}
        title="Block LaTeX"
      >
        Σ
      </button>
      <button
        type="button"
        onClick={() => onInsert("iframe")}
        className={btnClass}
        title="Embed (iframe)"
      >
        <Maximize2 className="w-4 h-4 mx-auto" />
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-300 self-center mx-1 dark:bg-gray-700" />

      {/* Media and Links */}
      <button
        type="button"
        onClick={() => onInsert("link")}
        className={btnClass}
        title="Link"
      >
        <LinkIcon className="w-4 h-4 mx-auto" />
      </button>
      <button
        type="button"
        onClick={() => onInsert("img")}
        className={btnClass}
        title="Image"
      >
        <ImageIcon className="w-4 h-4 mx-auto" />
      </button>

      {variant === "publish" && (
        <>
          {/* Divider */}
          <div className="w-px h-5 bg-gray-300 self-center mx-1 dark:bg-gray-700" />

          {/* Layout Elements (publish only) */}
          <button
            type="button"
            onClick={() => onInsert("quote")}
            className={btnClass}
            title="Quote"
          >
            <Quote className="w-4 h-4 mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => onInsert("list")}
            className={btnClass}
            title="List"
          >
            <List className="w-4 h-4 mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => onInsert("table")}
            className={btnClass}
            title="Table"
          >
            <Table className="w-4 h-4 mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => onInsert("alert")}
            className={btnClass}
            title="Alert Box"
          >
            <AlertTriangle className="w-4 h-4 mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => onInsert("divider")}
            className={btnClass}
            title="Divider"
          >
            <Minus className="w-4 h-4 mx-auto" />
          </button>
        </>
      )}

      {variant === "note" && (
        <>
          {/* List button for note variant */}
          <button
            type="button"
            onClick={() => onInsert("list")}
            className={btnClass}
            title="List"
          >
            <List className="w-4 h-4 mx-auto" />
          </button>
        </>
      )}
    </div>
  );
};

export default RichTextToolbar;
