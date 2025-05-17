import Prism from "./vendor/prism";
import { Logger } from "@utils/logger";

type LanguageMap = Record<string, string[]>;

export const CodeLanguageMap: LanguageMap = {
    "Markup": [
        "markup",
        "html",
        "xml",
        "svg",
        "mathml",
        "ssml",
        "atom",
        "rss",
    ],
    "CSS": [
        "css",
    ],
    "C-like": [
        "clike",
    ],
    "Regex": [
        "regex",
    ],
    "JavaScript": [
        "javascript",
        "js",
    ],
    "ABAP": [
        "abap",
    ],
    "ABNF": [
        "abnf",
    ],
    "ActionScript": [
        "actionscript",
    ],
    "Ada": [
        "ada",
    ],
    "Agda": [
        "agda",
    ],
    "AL": [
        "al",
    ],
    "ANTLR4": [
        "antlr4",
        "g4",
    ],
    "Apache Configuration": [
        "apacheconf",
    ],
    "SQL": [
        "sql",
    ],
    "Apex": [
        "apex",
    ],
    "APL": [
        "apl",
    ],
    "AppleScript": [
        "applescript",
    ],
    "AQL": [
        "aql",
    ],
    "C": [
        "c",
    ],
    "Cpp": [
        "c++",
        "cplusplus",
    ],
    "Arduino": [
        "arduino",
        "ino",
    ],
    "ARFF": [
        "arff",
    ],
    "ARM Assembly": [
        "armasm",
        "arm-asm",
    ],
    "Bash": [
        "bash",
        "sh",
        "shell",
    ],
    "YAML": [
        "yaml",
        "yml",
    ],
    "Markdown": [
        "markdown",
        "md",
    ],
    "Arturo": [
        "arturo",
        "art",
    ],
    "AsciiDoc": [
        "asciidoc",
        "adoc",
    ],
    "C#": [
        "csharp",
        "cs",
        "dotnet",
    ],
    "ASP.NET (C#)": [
        "aspnet",
    ],
    "6502 Assembly": [
        "asm6502",
    ],
    "Atmel AVR Assembly": [
        "asmatmel",
    ],
    "AutoHotkey": [
        "autohotkey",
    ],
    "AutoIt": [
        "autoit",
    ],
    "AviSynth": [
        "avisynth",
        "avs",
    ],
    "Avro IDL": [
        "avro-idl",
        "avdl",
    ],
    "AWK": [
        "awk",
        "gawk",
    ],
    "BASIC": [
        "basic",
    ],
    "Batch": [
        "batch",
    ],
    "BBcode": [
        "bbcode",
        "shortcode",
    ],
    "BBj": [
        "bbj",
    ],
    "Bicep": [
        "bicep",
    ],
    "Birb": [
        "birb",
    ],
    "Bison": [
        "bison",
    ],
    "BNF": [
        "bnf",
        "rbnf",
    ],
    "BQN": [
        "bqn",
    ],
    "Brainfuck": [
        "brainfuck",
    ],
    "BrightScript": [
        "brightscript",
    ],
    "Bro": [
        "bro",
    ],
    "CFScript": [
        "cfscript",
        "cfc",
    ],
    "ChaiScript": [
        "chaiscript",
    ],
    "CIL": [
        "cil",
    ],
    "Cilk/C": [
        "cilkc",
        "cilk-c",
    ],
    "Cilk/C++": [
        "cilkcpp",
        "cilk-cpp",
        "cilk",
    ],
    "Clojure": [
        "clojure",
    ],
    "CMake": [
        "cmake",
    ],
    "COBOL": [
        "cobol",
    ],
    "CoffeeScript": [
        "coffeescript",
        "coffee",
    ],
    "Concurnas": [
        "concurnas",
        "conc",
    ],
    "Content-Security-Policy": [
        "csp",
    ],
    "Cooklang": [
        "cooklang",
    ],
    "Ruby": [
        "ruby",
        "rb",
    ],
    "Crystal": [
        "crystal",
    ],
    "CSV": [
        "csv",
    ],
    "CUE": [
        "cue",
    ],
    "Cypher": [
        "cypher",
    ],
    "D": [
        "d",
    ],
    "Dart": [
        "dart",
    ],
    "DataWeave": [
        "dataweave",
    ],
    "DAX": [
        "dax",
    ],
    "Dhall": [
        "dhall",
    ],
    "Diff": [
        "diff",
    ],
    "Markup templating": [
        "markup-templating",
    ],
    "Django/Jinja2": [
        "django",
        "jinja2",
    ],
    "DNS zone file": [
        "dns-zone-file",
        "dns-zone",
    ],
    "Docker": [
        "docker",
        "dockerfile",
    ],
    "DOT (Graphviz)": [
        "dot",
        "gv",
    ],
    "EBNF": [
        "ebnf",
    ],
    "EditorConfig": [
        "editorconfig",
    ],
    "Eiffel": [
        "eiffel",
    ],
    "EJS": [
        "ejs",
        "eta",
    ],
    "Elixir": [
        "elixir",
    ],
    "Elm": [
        "elm",
    ],
    "Lua": [
        "lua",
    ],
    "Embedded Lua templating": [
        "etlua",
    ],
    "ERB": [
        "erb",
    ],
    "Erlang": [
        "erlang",
    ],
    "Excel Formula": [
        "excel-formula",
        "xlsx",
        "xls",
    ],
    "F#": [
        "fsharp",
    ],
    "Factor": [
        "factor",
    ],
    "False": [
        "false",
    ],
    "Firestore security rules": [
        "firestore-security-rules",
    ],
    "Flow": [
        "flow",
    ],
    "Fortran": [
        "fortran",
    ],
    "FreeMarker Template Language": [
        "ftl",
    ],
    "GameMaker Language": [
        "gml",
        "gamemakerlanguage",
    ],
    "GAP (CAS)": [
        "gap",
    ],
    "G-code": [
        "gcode",
    ],
    "GDScript": [
        "gdscript",
    ],
    "GEDCOM": [
        "gedcom",
    ],
    "gettext": [
        "gettext",
        "po",
    ],
    "Git": [
        "git",
    ],
    "GLSL": [
        "glsl",
    ],
    "GN": [
        "gn",
        "gni",
    ],
    "GNU Linker Script": [
        "linker-script",
        "ld",
    ],
    "Go": [
        "go",
    ],
    "Go module": [
        "go-module",
        "go-mod",
    ],
    "Gradle": [
        "gradle",
    ],
    "GraphQL": [
        "graphql",
    ],
    "Groovy": [
        "groovy",
    ],
    "Less": [
        "less",
    ],
    "Sass (SCSS)": [
        "scss",
    ],
    "Textile": [
        "textile",
    ],
    "Haml": [
        "haml",
    ],
    "Handlebars": [
        "handlebars",
        "hbs",
        "mustache",
    ],
    "Haskell": [
        "haskell",
        "hs",
    ],
    "Haxe": [
        "haxe",
    ],
    "HCL": [
        "hcl",
    ],
    "HLSL": [
        "hls",
    ],
    "Hoon": [
        "hoon",
    ],
    "HTTP Public-Key-Pins": [
        "hpkp",
    ],
    "HTTP Strict-Transport-Security": [
        "hsts",
    ],
    "JSON": [
        "json",
        "webmanifest",
    ],
    "URI": [
        "uri",
        "url",
    ],
    "HTTP": [
        "http",
    ],
    "IchigoJam": [
        "ichigojam",
    ],
    "Icon": [
        "icon",
    ],
    "ICU Message Format": [
        "icu-message-format",
    ],
    "Idris": [
        "idris",
        "idr",
    ],
    ".ignore": [
        "ignore",
        "gitignore",
        "hgignore",
        "npmignore",
    ],
    "Inform 7": [
        "inform7",
    ],
    "Ini": [
        "ini",
    ],
    "Io": [
        "io",
    ],
    "J": [
        "j",
    ],
    "Java": [
        "java",
    ],
    "Scala": [
        "scala",
    ],
    "PHP": [
        "php",
    ],
    "JavaDoc-like": [
        "javadoclike",
    ],
    "JavaDoc": [
        "javadoc",
    ],
    "Java stack trace": [
        "javastacktrace",
    ],
    "Jolie": [
        "jolie",
    ],
    "JQ": [
        "jq",
    ],
    "TypeScript": [
        "typescript",
        "ts",
    ],
    "JSDoc": [
        "jsdoc",
    ],
    "N4JS": [
        "n4js",
        "n4jsd",
    ],
    "JSON5": [
        "json5",
    ],
    "JSONP": [
        "jsonp",
    ],
    "JS stack trace": [
        "jsstacktrace",
    ],
    "Julia": [
        "julia",
    ],
    "Keepalived Configure": [
        "keepalived",
    ],
    "Keyman": [
        "keyman",
    ],
    "Kotlin": [
        "kotlin",
        "kt",
        "kts",
    ],
    "Kusto": [
        "kusto",
    ],
    "LaTeX": [
        "latex",
        "tex",
        "context",
    ],
    "Latte": [
        "latte",
    ],
    "Scheme": [
        "scheme",
    ],
    "LilyPond": [
        "lilypond",
        "ly",
    ],
    "Liquid": [
        "liquid",
    ],
    "Lisp": [
        "lisp",
        "emacs",
        "elisp",
        "emacs-lisp",
    ],
    "LiveScript": [
        "livescript",
    ],
    "LLVM IR": [
        "llvm",
    ],
    "Log file": [
        "log",
    ],
    "LOLCODE": [
        "lolcode",
    ],
    "Magma (CAS)": [
        "magma",
    ],
    "Makefile": [
        "makefile",
    ],
    "Mata": [
        "mata",
    ],
    "MATLAB": [
        "matlab",
    ],
    "MAXScript": [
        "maxscript",
    ],
    "MEL": [
        "mel",
    ],
    "Mermaid": [
        "mermaid",
    ],
    "METAFONT": [
        "metafont",
    ],
    "Mizar": [
        "mizar",
    ],
    "MongoDB": [
        "mongodb",
    ],
    "Monkey": [
        "monkey",
    ],
    "MoonScript": [
        "moonscript",
        "moon",
    ],
    "N1QL": [
        "n1ql",
    ],
    "Nand To Tetris HDL": [
        "nand2tetris-hdl",
    ],
    "Naninovel Script": [
        "naniscript",
        "nani",
    ],
    "NASM": [
        "nasm",
    ],
    "NEON": [
        "neon",
    ],
    "Nevod": [
        "nevod",
    ],
    "nginx": [
        "nginx",
    ],
    "Nim": [
        "nim",
    ],
    "Nix": [
        "nix",
    ],
    "NSIS": [
        "nsis",
    ],
    "Objective-C": [
        "objectivec",
        "objc",
    ],
    "OCaml": [
        "ocaml",
    ],
    "Odin": [
        "odin",
    ],
    "OpenCL": [
        "opencl",
    ],
    "OpenQasm": [
        "openqasm",
        "qasm",
    ],
    "Oz": [
        "oz",
    ],
    "PARI/GP": [
        "parigp",
    ],
    "Parser": [
        "parser",
    ],
    "Pascal": [
        "pascal",
        "objectpascal",
    ],
    "Pascaligo": [
        "pascaligo",
    ],
    "PATROL Scripting Language": [
        "psl",
    ],
    "PC-Axis": [
        "pcaxis",
        "px",
    ],
    "PeopleCode": [
        "peoplecode",
        "pcode",
    ],
    "Perl": [
        "perl",
    ],
    "PHPDoc": [
        "phpdoc",
    ],
    "PlantUML": [
        "plant-uml",
        "plantuml",
    ],
    "PL/SQL": [
        "plsql",
    ],
    "PowerQuery": [
        "powerquery",
        "pq",
        "mscript",
    ],
    "PowerShell": [
        "powershell",
    ],
    "Processing": [
        "processing",
    ],
    "Prolog": [
        "prolog",
    ],
    "PromQL": [
        "promql",
    ],
    ".properties": [
        "properties",
    ],
    "Protocol Buffers": [
        "protobuf",
    ],
    "Stylus": [
        "stylus",
    ],
    "Twig": [
        "twig",
    ],
    "Pug": [
        "pug",
    ],
    "Puppet": [
        "puppet",
    ],
    "PureBasic": [
        "purebasic",
        "pbfasm",
    ],
    "Python": [
        "python",
        "py",
    ],
    "Q#": [
        "qsharp",
        "qs",
    ],
    "Q (kdb+ database)": [
        "q",
    ],
    "QML": [
        "qml",
    ],
    "Qore": [
        "qore",
    ],
    "R": [
        "r",
    ],
    "Racket": [
        "racket",
        "rkt",
    ],
    "Razor C#": [
        "cshtml",
        "razor",
    ],
    "React JSX": [
        "jsx",
    ],
    "React TSX": [
        "tsx",
    ],
    "Reason": [
        "reason",
    ],
    "Rego": [
        "rego",
    ],
    "Ren'py": [
        "renpy",
        "rpy",
    ],
    "ReScript": [
        "rescript",
        "res",
    ],
    "reST (reStructuredText)": [
        "rest",
    ],
    "Rip": [
        "rip",
    ],
    "Roboconf": [
        "roboconf",
    ],
    "Robot Framework": [
        "robotframework",
        "robot",
    ],
    "Rust": [
        "rust",
    ],
    "SAS": [
        "sas",
    ],
    "Sass (Sass)": [
        "sass",
    ],
    "Shell session": [
        "shell-session",
        "sh-session",
        "shellsession",
    ],
    "Smali": [
        "smali",
    ],
    "Smalltalk": [
        "smalltalk",
    ],
    "Smarty": [
        "smarty",
    ],
    "SML": [
        "sml",
        "smlnj",
    ],
    "Solidity (Ethereum)": [
        "solidity",
        "sol",
    ],
    "Solution file": [
        "solution-file",
        "sln",
    ],
    "Soy (Closure Template)": [
        "soy",
    ],
    "Splunk SPL": [
        "splunk-spl",
    ],
    "SQF: Status Quo Function (Arma 3)": [
        "sqf",
    ],
    "Squirrel": [
        "squirrel",
    ],
    "Stan": [
        "stan",
    ],
    "Stata Ado": [
        "stata",
    ],
    "Structured Text (IEC 61131-3)": [
        "iecst",
    ],
    "SuperCollider": [
        "supercollider",
        "sclang",
    ],
    "Swift": [
        "swift",
    ],
    "Systemd configuration file": [
        "systemd",
    ],
    "T4 templating": [
        "t4-templating",
    ],
    "T4 Text Templates (C#)": [
        "t4-cs",
        "t4",
    ],
    "VB.Net": [
        "vbnet",
    ],
    "T4 Text Templates (VB)": [
        "t4-vb",
    ],
    "TAP": [
        "tap",
    ],
    "Tcl": [
        "tcl",
    ],
    "Template Toolkit 2": [
        "tt2",
    ],
    "TOML": [
        "toml",
    ],
    "Tremor": [
        "tremor",
        "trickle",
        "troy",
    ],
    "TypoScript": [
        "typoscript",
        "tsconfig",
    ],
    "UnrealScript": [
        "unrealscript",
        "uscript",
        "uc",
    ],
    "UO Razor Script": [
        "uorazor",
    ],
    "V": [
        "v",
    ],
    "Vala": [
        "vala",
    ],
    "Velocity": [
        "velocity",
    ],
    "Verilog": [
        "verilog",
    ],
    "VHDL": [
        "vhdl",
    ],
    "vim": [
        "vim",
    ],
    "Visual Basic": [
        "visual-basic",
        "vb",
        "vba",
    ],
    "WarpScript": [
        "warpscript",
    ],
    "WebAssembly": [
        "wasm",
    ],
    "Web IDL": [
        "web-idl",
        "webidl",
    ],
    "WGSL": [
        "wgsl",
    ],
    "Wiki markup": [
        "wiki",
    ],
    "Wolfram language": [
        "wolfram",
        "mathematica",
        "nb",
        "wl",
    ],
    "Wren": [
        "wren",
    ],
    "Xeora": [
        "xeora",
        "xeoracube",
    ],
    "Xojo (REALbasic)": [
        "xojo",
    ],
    "XQuery": [
        "xquery",
    ],
    "YANG": [
        "yang",
    ],
    "Zig": [
        "zig",
    ],
};

export const CodeLanguageAliases: Record<string, string> = Object.entries(CodeLanguageMap).reduce<
    Record<string, string>
>((acc, [language, aliases]) => {
    const lowerLanguage = language.toLowerCase();
    return {
        ...acc,
        [lowerLanguage]: lowerLanguage,
        ...aliases.reduce((aliasAcc, alias) => ({ ...aliasAcc, [alias]: lowerLanguage }), {}),
    };
}, {});

export function getLanguageByAlias(alias: string): string | undefined {
    const normalizedAlias = alias.toLowerCase().trim();
    const resolvedLanguage = CodeLanguageAliases[normalizedAlias];
    return resolvedLanguage ?? "text";
}

export function getDisplayName(language: string): string {
    const lang = getLanguageByAlias(language) ?? language.toLowerCase();
    const displayName = Object.keys(CodeLanguageMap).find((key) => key.toLowerCase() === lang) ?? lang;
    return displayName.charAt(0).toUpperCase() + displayName.slice(1);
}

export function highlightCode(code: string, language: string): string {
    const lowerLanguage = getLanguageByAlias(language) ?? language.toLowerCase();
    let prismLang = lowerLanguage;

    if (!Prism.languages[prismLang]) {
        Logger.debug(`Language "${prismLang}" not supported by Prism, falling back to "text"`);
        prismLang = "text";
    }

    const highlighted = Prism.highlight(code, Prism.languages[prismLang] ?? Prism.languages.text, prismLang);
    return `<pre class="language-${lowerLanguage}"><code>${highlighted}</code></pre>`;
}

export function detectLanguage(code: string): string {
    if (!code.trim()) return "text";

    const languageChecks: [string, string[]][] = [
        ["javascript", ["function", "var", "let", "const"]],
        ["python", ["def", "class", "if", "import"]],
        ["cpp", ["int", "void", "class", "if"]],
        ["java", ["public", "class", "void", "int"]],
    ];

    for (const [lang, keywords] of languageChecks) {
        if (keywords.some((keyword) => code.includes(keyword))) {
            return lang;
        }
    }

    return "text";
}