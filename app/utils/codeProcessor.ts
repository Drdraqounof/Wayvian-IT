/**
 * Code Processor Utility for Wayvian AI
 * Handles line numbering, code scanning, and change detection
 */

export interface CodeLine {
  lineNumber: number;
  content: string;
  trimmed: string;
}

export interface ScanResult {
  lineNumber: number;
  content: string;
  matchType: string;
}

export interface CodeChange {
  lineNumber: number;
  oldContent: string;
  newContent: string;
  changeType: 'added' | 'modified' | 'deleted';
}

/**
 * Parse code into structured lines with line numbers
 */
export function parseCode(code: string): CodeLine[] {
  return code.split('\n').map((content, index) => ({
    lineNumber: index + 1,
    content,
    trimmed: content.trim(),
  }));
}

/**
 * Format code with line numbers for AI consumption
 * Format: "  1 | code content"
 */
export function formatCodeWithLineNumbers(code: string): string {
  const lines = code.split('\n');
  const padding = String(lines.length).length;
  
  return lines
    .map((line, i) => `${String(i + 1).padStart(padding + 1, ' ')} | ${line}`)
    .join('\n');
}

/**
 * Scan code for specific patterns and return exact line numbers
 */
export function scanCode(code: string, patterns: ScanPattern[]): ScanResult[] {
  const lines = parseCode(code);
  const results: ScanResult[] = [];

  for (const line of lines) {
    for (const pattern of patterns) {
      if (matchesPattern(line, pattern)) {
        results.push({
          lineNumber: line.lineNumber,
          content: line.content,
          matchType: pattern.type,
        });
      }
    }
  }

  return results;
}

export interface ScanPattern {
  type: string;
  regex?: RegExp;
  keywords?: string[];
  exact?: string;
}

/**
 * Check if a line matches a pattern
 */
function matchesPattern(line: CodeLine, pattern: ScanPattern): boolean {
  if (pattern.regex) {
    return pattern.regex.test(line.content);
  }
  if (pattern.keywords) {
    return pattern.keywords.some(kw => 
      line.trimmed.toLowerCase().includes(kw.toLowerCase())
    );
  }
  if (pattern.exact) {
    return line.trimmed === pattern.exact;
  }
  return false;
}

/**
 * Common code patterns for different languages
 */
export const CODE_PATTERNS = {
  // JavaScript/TypeScript patterns
  js: {
    functions: { type: 'function', regex: /\b(function\s+\w+|const\s+\w+\s*=\s*(\(|async\s*\()|=>\s*{)/ },
    variables: { type: 'variable', regex: /\b(const|let|var)\s+\w+\s*=/ },
    classes: { type: 'class', regex: /\bclass\s+\w+/ },
    imports: { type: 'import', regex: /^import\s+/ },
    exports: { type: 'export', regex: /^export\s+/ },
    comments: { type: 'comment', regex: /^\s*(\/\/|\/\*|\*)/ },
  },
  
  // HTML patterns
  html: {
    tags: { type: 'tag', regex: /<\/?[a-zA-Z][^>]*>/ },
    scripts: { type: 'script', regex: /<\/?script/ },
    styles: { type: 'style', regex: /<\/?style/ },
    buttons: { type: 'button', keywords: ['<button', 'type="button"', "type='button'"] },
    inputs: { type: 'input', keywords: ['<input', '<textarea', '<select'] },
    headings: { type: 'heading', regex: /<\/?h[1-6]/ },
    divs: { type: 'div', keywords: ['<div', '</div>'] },
    links: { type: 'link', keywords: ['<a ', '</a>'] },
  },
  
  // CSS patterns
  css: {
    selectors: { type: 'selector', regex: /^[.#a-zA-Z][^{]*\{/ },
    properties: { type: 'property', regex: /^\s*[a-z-]+\s*:/ },
    mediaQueries: { type: 'media', regex: /@media/ },
    keyframes: { type: 'keyframes', regex: /@keyframes/ },
    variables: { type: 'css-var', regex: /--[a-zA-Z]/ },
    colors: { type: 'color', regex: /(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/ },
  },
  
  // Python patterns
  python: {
    functions: { type: 'function', regex: /^\s*def\s+\w+/ },
    classes: { type: 'class', regex: /^\s*class\s+\w+/ },
    imports: { type: 'import', regex: /^(import|from)\s+/ },
    comments: { type: 'comment', regex: /^\s*#/ },
    decorators: { type: 'decorator', regex: /^\s*@\w+/ },
  },
};

/**
 * Find elements by common names (buttons, titles, etc.)
 */
export function findElements(code: string, elementType: string, language: string): ScanResult[] {
  const lines = parseCode(code);
  const results: ScanResult[] = [];
  
  const searches: Record<string, Record<string, RegExp[]>> = {
    html: {
      button: [/button\s*\{/, /<button/, /\.btn/, /createelement\s*\(\s*['"]button/i],
      title: [/<title/, /<h1/, /\.title/, /class=["'][^"']*title/i],
      input: [/<input/, /input\s*\{/, /\.input/, /createelement\s*\(\s*['"]input/i],
      form: [/<form/, /form\s*\{/, /\.form/],
      link: [/<a\s/, /\.link/, /a\s*\{/],
      image: [/<img/, /\.image/, /\.img/],
      header: [/<header/, /\.header/, /header\s*\{/],
      footer: [/<footer/, /\.footer/, /footer\s*\{/],
      nav: [/<nav/, /\.nav/, /nav\s*\{/],
      div: [/<div/, /\.container/, /\.wrapper/],
    },
    css: {
      button: [/button\s*\{/, /\.btn/, /\[type=["']?button/],
      color: [/color\s*:/, /background/, /#[0-9a-f]{3,8}/i, /rgb/],
      font: [/font-/, /text-/],
      margin: [/margin/],
      padding: [/padding/],
      border: [/border/],
      animation: [/animation/, /@keyframes/, /transition/],
    },
    javascript: {
      button: [/button/i, /\.btn/, /onclick/i],
      function: [/function\s+\w+/, /const\s+\w+\s*=.*=>/, /=>\s*\{/],
      variable: [/const\s+/, /let\s+/, /var\s+/],
      event: [/addEventListener/, /onclick/, /onchange/],
      fetch: [/fetch\s*\(/, /axios/, /\.get\(/, /\.post\(/],
    },
  };

  const langPatterns = searches[language] || searches.html;
  const patterns = langPatterns[elementType.toLowerCase()] || [];
  
  for (const line of lines) {
    for (const regex of patterns) {
      if (regex.test(line.content.toLowerCase())) {
        // Avoid duplicates
        if (!results.some(r => r.lineNumber === line.lineNumber)) {
          results.push({
            lineNumber: line.lineNumber,
            content: line.content,
            matchType: elementType,
          });
        }
      }
    }
  }
  
  return results;
}

/**
 * Compare two versions of code and identify changes
 */
export function diffCode(oldCode: string, newCode: string): CodeChange[] {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const changes: CodeChange[] = [];
  
  const maxLines = Math.max(oldLines.length, newLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    
    if (oldLine === undefined && newLine !== undefined) {
      changes.push({
        lineNumber: i + 1,
        oldContent: '',
        newContent: newLine,
        changeType: 'added',
      });
    } else if (newLine === undefined && oldLine !== undefined) {
      changes.push({
        lineNumber: i + 1,
        oldContent: oldLine,
        newContent: '',
        changeType: 'deleted',
      });
    } else if (oldLine !== newLine) {
      changes.push({
        lineNumber: i + 1,
        oldContent: oldLine,
        newContent: newLine,
        changeType: 'modified',
      });
    }
  }
  
  return changes;
}

/**
 * Apply changes to code at specific line numbers
 */
export function applyChanges(code: string, changes: { line: number; newContent: string }[]): string {
  const lines = code.split('\n');
  
  for (const change of changes) {
    if (change.line >= 1 && change.line <= lines.length) {
      lines[change.line - 1] = change.newContent;
    }
  }
  
  return lines.join('\n');
}

/**
 * Insert lines at a specific position
 */
export function insertLines(code: string, afterLine: number, newLines: string[]): string {
  const lines = code.split('\n');
  lines.splice(afterLine, 0, ...newLines);
  return lines.join('\n');
}

/**
 * Delete lines from code
 */
export function deleteLines(code: string, startLine: number, endLine: number): string {
  const lines = code.split('\n');
  lines.splice(startLine - 1, endLine - startLine + 1);
  return lines.join('\n');
}

/**
 * Get context around a specific line (for better AI understanding)
 */
export function getLineContext(code: string, lineNumber: number, contextLines: number = 3): string {
  const lines = code.split('\n');
  const start = Math.max(0, lineNumber - contextLines - 1);
  const end = Math.min(lines.length, lineNumber + contextLines);
  
  return lines
    .slice(start, end)
    .map((line, i) => {
      const num = start + i + 1;
      const marker = num === lineNumber ? '>>>' : '   ';
      return `${marker}${String(num).padStart(3, ' ')} | ${line}`;
    })
    .join('\n');
}

/**
 * Build a summary of code structure for AI
 */
export function buildCodeSummary(code: string, language: string): string {
  const lines = parseCode(code);
  const summary: string[] = [];
  
  // Detect language-specific structures
  const patterns = CODE_PATTERNS[language as keyof typeof CODE_PATTERNS] || CODE_PATTERNS.js;
  
  for (const [name, pattern] of Object.entries(patterns)) {
    const matches = scanCode(code, [pattern as ScanPattern]);
    if (matches.length > 0) {
      const lineNums = matches.map(m => m.lineNumber).join(', ');
      summary.push(`${name}: lines ${lineNums}`);
    }
  }
  
  return summary.join('\n');
}

/**
 * Validate that line numbers in AI response match the code
 */
export function validateLineNumbers(code: string, lineNumbers: number[]): { valid: number[]; invalid: number[] } {
  const totalLines = code.split('\n').length;
  const valid: number[] = [];
  const invalid: number[] = [];
  
  for (const num of lineNumbers) {
    if (num >= 1 && num <= totalLines) {
      valid.push(num);
    } else {
      invalid.push(num);
    }
  }
  
  return { valid, invalid };
}

/**
 * Extract line numbers from AI response text
 * Supports: individual lines (1,2,3), ranges (5-10), and mixed (1,3,5-10,15)
 */
export function extractLineNumbersFromResponse(response: string): number[] {
  const lineNumbers: number[] = [];
  
  // Match [HIGHLIGHT_LINES]1,2,3,5-10[/HIGHLIGHT_LINES]
  const highlightMatch = response.match(/\[HIGHLIGHT_LINES\]([\d,\s\-]+)\[\/HIGHLIGHT_LINES\]/);
  if (highlightMatch) {
    const nums = parseLineRanges(highlightMatch[1]);
    lineNumbers.push(...nums);
  }
  
  // Match "Line X:" or "line X" patterns using exec loop
  const lineRegex = /[Ll]ine\s+(\d+)/g;
  let match;
  while ((match = lineRegex.exec(response)) !== null) {
    const num = parseInt(match[1]);
    if (!isNaN(num) && !lineNumbers.includes(num)) {
      lineNumbers.push(num);
    }
  }
  
  return lineNumbers;
}

/**
 * Parse line ranges like "1,3,5-10,15-20" into individual line numbers
 */
export function parseLineRanges(input: string): number[] {
  const lineNumbers: number[] = [];
  const parts = input.split(',').map(p => p.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      // Range like "5-10"
      const [start, end] = part.split('-').map(n => parseInt(n.trim()));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          if (!lineNumbers.includes(i)) {
            lineNumbers.push(i);
          }
        }
      }
    } else {
      // Single number
      const num = parseInt(part);
      if (!isNaN(num) && !lineNumbers.includes(num)) {
        lineNumbers.push(num);
      }
    }
  }
  
  return lineNumbers.sort((a, b) => a - b);
}
