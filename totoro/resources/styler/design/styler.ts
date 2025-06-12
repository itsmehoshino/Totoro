import * as fs from "fs-extra";
import * as path from "path";
import * as fonts from "./fonts";

const DESIGNS_FILE = path.join(__dirname, "./plugin/designs.json");

function initializeDesignsFile() {
  if (!fs.existsSync(DESIGNS_FILE)) {
    fs.writeFileSync(DESIGNS_FILE, JSON.stringify({}, null, 2));
  }
}

function loadDesigns(): object {
  initializeDesignsFile();
  try {
    return JSON.parse(fs.readFileSync(DESIGNS_FILE, "utf-8"));
  } catch (error) {
    console.error("Error loading designs:", error);
    return {};
  }
}

function saveDesign(name: string, template: string): boolean {
  const designs = loadDesigns();
  designs[name] = template;
  try {
    fs.writeFileSync(DESIGNS_FILE, JSON.stringify(designs, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving design:", error);
    return false;
  }
}

function applyFont(text: string, style: string | string[]): string {
  if (!text) return "";

  let styledText = text
    .replace(/\*\*(.*?)\*\*/g, (_, p1) => {
      return fonts.bold ? fonts.bold(p1) : `**${p1}**`
    })
    .replace(/\*(.*?)\*/g, (_, p1) => {
      return fonts.italic ? fonts.italic(p1) : `*${p1}*`;
    });

  if (style) {
    if (Array.isArray(style)) {
      return style.reduce(
        (formattedText, font) => fonts[font]?.(formattedText) || formattedText,
        styledText
      );
    }
    return fonts[style]?.(styledText) || styledText;
  }

  return styledText;
}

export function styler(type: string, title: string | null, content: string | null, footer: string | null, styles: {title?: string | string[], content?: string | string[], footer?: string | string[]} = {}): string {
  title = applyFont(title || "", styles.title);
  content = applyFont(content || "", styles.content);
  footer = applyFont(footer || "", styles.footer);

  const designs = loadDesigns();

  const template = designs[type];

  if (!template) {
    return `${title}\n${content}${footer ? `\n${footer}` : ""}`.trim();
  }

  return template
    .replace("{title}", title)
    .replace("{content}", content)
    .replace("{footer}", footer)
    .trim();
}

export function addDesign(name: string, template: string): boolean {
  if (!name || !template || typeof template !== "string") {
    throw new Error("Name and template must be valid strings");
  }
  if (!template.includes("{title}") || !template.includes("{content}")) {
    throw new Error("Template must include {title} and {content} placeholders");
  }
  return saveDesign(name, template);
}

export { applyFont };
