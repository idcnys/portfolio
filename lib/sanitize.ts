import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "iframe",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
];

const allowedAttributes: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel", "class"],
  img: ["src", "alt", "class"],
  iframe: [
    "src",
    "width",
    "height",
    "frameborder",
    "allow",
    "allowfullscreen",
    "class",
    "style",
  ],
  "*": ["class"],
  code: ["class"],
  pre: ["class"],
};

export const sanitizeRichHtml = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ["http", "https", "mailto", "tel", "data"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });
};

export const sanitizePlainText = (value: string): string => {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

export const sanitizeExternalUrl = (value: string): string => {
  const cleaned = sanitizePlainText(value);
  if (!cleaned) {
    return "";
  }
  return /^https?:\/\//i.test(cleaned) ? cleaned : "";
};
