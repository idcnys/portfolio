declare module "katex/contrib/auto-render" {
  export interface Delimiter {
    left: string;
    right: string;
    display: boolean;
  }

  export interface AutoRenderOptions {
    delimiters?: Delimiter[];
    ignoredTags?: string[];
    ignoredClasses?: string[];
    throwOnError?: boolean;
    errorCallback?: (message: string, error: Error) => void;
    preProcess?: (math: string) => string;
    macros?: Record<string, string>;
    [key: string]: unknown;
  }

  export default function renderMathInElement(
    element: HTMLElement,
    options?: AutoRenderOptions,
  ): void;
}
