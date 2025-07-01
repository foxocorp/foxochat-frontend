import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { highlightCode, getLanguageByAlias, detectLanguage } from "@/codeLanguages";
import { Logger } from "@utils/logger";

interface WrapRichTextOptions {
    noLineBreaks?: boolean;
    highlight?: boolean;
}

const md = new MarkdownIt({
    html: false,
    xhtmlOut: false,
    breaks: true,
    linkify: true,
    typographer: true,
    highlight: (str: string, lang: string) => {
        const cleanedStr = str.replace(/```\s*$/, "").trim();
        const language = lang.toLowerCase() || detectLanguage(cleanedStr);
        const resolvedLang = getLanguageByAlias(language) ?? language;
        return highlightCode(cleanedStr, resolvedLang);
    },
});

md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
    const token = tokens[idx];
    if (!token) return '';
    const aIndex = token.attrIndex && token.attrIndex('class');
    if (typeof aIndex !== 'number' || aIndex < 0) {
        token.attrPush && token.attrPush(['class', 'message-link']);
    } else if (token.attrs && token.attrs[aIndex]) {
        token.attrs[aIndex][1] += ' message-link';
    }
    token.attrPush && token.attrPush(['target', '_blank']);
    token.attrPush && token.attrPush(['rel', 'noopener noreferrer']);
    return self.renderToken(tokens, idx, options);
};

export const wrapRichText = (text: string, options: WrapRichTextOptions = {}): string => {
    const { noLineBreaks = false } = options;

    let processedText: string;

    try {
        processedText = md.render(text);
        processedText = processedText.replace(/```/g, "");
    } catch (error) {
        Logger.error(`Markdown rendering failed: ${error}`);
        processedText = text;
    }

    processedText = sanitizeHtml(processedText, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["pre", "code", "span"]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            pre: ["class"],
            code: ["class"],
            span: ["class"],
            a: ["href", "class", "target", "rel"],
        },
    });

    if (noLineBreaks) {
        processedText = processedText.replace(/<br\s*\/?>(?!\n)/gi, " ");
    }

    return processedText;
};