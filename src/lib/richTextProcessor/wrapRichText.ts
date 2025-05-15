import MarkdownIt from "markdown-it";
import { highlightCode, getLanguageByAlias, detectLanguage } from "@/codeLanguages";
import { Logger } from "@utils/logger";

interface WrapRichTextOptions {
    noLinks?: boolean
    noLineBreaks?: boolean
    highlight?: boolean
}

const languageDetectionCache = new Map<string, string>();

export const wrapRichText = (text: string, options: WrapRichTextOptions = {}): string => {
    const { noLinks = false, noLineBreaks = false, highlight = true } = options;

    let processedText = text;
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;

    processedText = processedText.replace(codeBlockRegex, (_match, lang, code) => {
        return `\`\`\`${lang}\n${code.trim()}\n\`\`\``;
    });

    const md = new MarkdownIt({
        html: false,
        linkify: !noLinks,
        breaks: !noLineBreaks,
        highlight: (str: string, lang: string) => {
            if (!highlight) {
                return `<pre class="language-text"><code>${md.utils.escapeHtml(str)}</code></pre>`;
            }

            if (lang) {
                const language = getLanguageByAlias(lang.toLowerCase()) ?? lang.toLowerCase();
                return highlightCode(str, language);
            }

            const codeHash = hashCode(str);
            if (languageDetectionCache.has(codeHash)) {
                const cachedLang = languageDetectionCache.get(codeHash)!;
                return highlightCode(str, cachedLang);
            }

            setTimeout(async () => {
                try {
                    const detectedLang = await detectLanguage(str);
                    languageDetectionCache.set(codeHash, detectedLang);
                } catch (error) {
                    Logger.error("Failed to detect a language:", error);
                }
            }, 0);

            return `<pre class="language-text"><code>${md.utils.escapeHtml(str)}</code></pre>`;
        },
    });

    try {
        let result = md.render(processedText);
        if (result.startsWith("<p>") && result.endsWith("</p>\n") && result.split("</p>").length === 2) {
            result = result.slice(3, -5);
        }
        return result;
    } catch (error) {
        // console.error("Failed to render Markdown:", error);
        return md.utils.escapeHtml(processedText);
    }
};

function hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}
