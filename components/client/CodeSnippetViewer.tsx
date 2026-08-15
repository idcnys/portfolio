import React from "react";

interface CodeSnippetViewerProps {
  code: string;
  language?: string;
}

const CodeSnippetViewer: React.FC<CodeSnippetViewerProps> = ({
  code,
  language,
}) => {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-950 p-4">
      <pre className="text-sm font-mono text-gray-100 overflow-x-auto">
        <code className={language ? `language-${language}` : ""}>{code}</code>
      </pre>
    </div>
  );
};

export default CodeSnippetViewer;
