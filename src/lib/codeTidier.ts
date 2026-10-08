/**
 * Cleanly tidies up and formats code:
 * - Trims trailing whitespace from every line
 * - Collapses excessive blank lines (at most 1 consecutive blank line)
 * - Trims leading and trailing empty lines
 * - Normalizes indentation according to nesting levels (braces or colons)
 */
export function tidyCode(source: string, language: string = 'cpp'): string {
  if (!source || !source.trim()) return source;

  // Split lines
  const rawLines = source.split(/\r?\n/);

  // 1. Strip trailing whitespace from every line
  const strippedLines = rawLines.map(line => line.trimEnd());

  // 2. Collapse consecutive blank lines to at most 1
  const collapsed: string[] = [];
  let prevIsBlank = false;
  for (const line of strippedLines) {
    const isBlank = line.trim().length === 0;
    if (isBlank) {
      if (!prevIsBlank) {
        collapsed.push('');
        prevIsBlank = true;
      }
    } else {
      collapsed.push(line);
      prevIsBlank = false;
    }
  }

  // 3. Trim leading and trailing empty lines
  while (collapsed.length > 0 && collapsed[0].trim() === '') {
    collapsed.shift();
  }
  while (collapsed.length > 0 && collapsed[collapsed.length - 1].trim() === '') {
    collapsed.pop();
  }

  if (collapsed.length === 0) return '';

  const indentUnit = '    '; // 4 spaces standard

  // Python formatting: Indent based on colons and dedent keywords
  if (language === 'python') {
    let indentLevel = 0;
    const result: string[] = [];

    for (let i = 0; i < collapsed.length; i++) {
      const line = collapsed[i];
      const trimmed = line.trim();

      if (!trimmed) {
        result.push('');
        continue;
      }

      // If line begins with dedent keywords: elif, else, except, finally
      if (/^(elif\b|else\b|except\b|finally\b)/.test(trimmed)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      result.push(indentUnit.repeat(indentLevel) + trimmed);

      // Increase indent if line ends with colon (and not a comment)
      const codeWithoutComment = trimmed.split('#')[0].trim();
      if (codeWithoutComment.endsWith(':')) {
        indentLevel++;
      }
    }

    return result.join('\n') + '\n';
  }

  // Brace-based languages: C, C++, Java, Kotlin
  let indentLevel = 0;
  const result: string[] = [];

  for (let i = 0; i < collapsed.length; i++) {
    const line = collapsed[i];
    const trimmed = line.trim();

    if (!trimmed) {
      result.push('');
      continue;
    }

    // Preprocessor directives in C/C++ (#include, #define, etc.) start at column 0
    if (trimmed.startsWith('#')) {
      result.push(trimmed);
      continue;
    }

    // Strip comments and string literals to count braces accurately
    let codeOnly = '';
    let inString = false;
    let stringQuote = '';

    for (let j = 0; j < trimmed.length; j++) {
      const char = trimmed[j];
      const nextChar = trimmed[j + 1];

      if (inString) {
        if (char === stringQuote && trimmed[j - 1] !== '\\') {
          inString = false;
        }
      } else {
        if (char === '/' && nextChar === '/') {
          // Line comment
          break;
        }
        if (char === '"' || char === "'") {
          inString = true;
          stringQuote = char;
        } else {
          codeOnly += char;
        }
      }
    }

    const openCount = (codeOnly.match(/\{/g) || []).length;
    const closeCount = (codeOnly.match(/\}/g) || []).length;

    // Check if current line starts with closing brace or class access label
    const startsWithClose = trimmed.startsWith('}');
    const isAccessSpecifier = /^(public|private|protected):/.test(trimmed);

    let effectiveIndent = indentLevel;
    if (startsWithClose) {
      effectiveIndent = Math.max(0, indentLevel - 1);
    } else if (isAccessSpecifier) {
      effectiveIndent = Math.max(0, indentLevel - 1);
    }

    result.push(indentUnit.repeat(Math.max(0, effectiveIndent)) + trimmed);

    // Update indent level for subsequent lines
    indentLevel = Math.max(0, indentLevel + openCount - closeCount);
  }

  return result.join('\n') + '\n';
}
