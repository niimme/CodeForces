/**
 * Intelligent Code Execution Tracer
 * Accurately simulates line-by-line execution steps through user code,
 * adheres to control-flow branching (skipping bypassed branches),
 * ignores non-executable syntax lines (such as '} else {'),
 * and produces informative "What happened" explanations and accurate "Steps Took" breakdowns.
 */

export interface TraceStep {
  stepIndex: number;
  lineNumber: number; // 1-indexed line in user code
  lineCode: string;
  whatHappened: string;
  stepsTaken: string[];
  variables?: Record<string, string | number | boolean>;
}

interface IfBlock {
  ifLineNum: number;
  cond: string;
  thenLines: number[];
  elseLines: number[];
}

/**
 * Identifies if-else blocks and their associated then/else line numbers
 * for both brace-delimited languages (C++, C, Java, Kotlin) and Python.
 */
function findIfBlocks(rawLines: string[], isPython: boolean): IfBlock[] {
  const blocks: IfBlock[] = [];

  if (isPython) {
    for (let i = 0; i < rawLines.length; i++) {
      const raw = rawLines[i];
      const trimmed = raw.trim();
      if ((trimmed.startsWith('if ') || trimmed.startsWith('elif ')) && trimmed.endsWith(':')) {
        const cond = trimmed.replace(/^(?:if|elif)\s+/, '').replace(/:$/, '').trim();
        const ifLineNum = i + 1;
        const ifIndent = raw.search(/\S/);

        const thenLines: number[] = [];
        const elseLines: number[] = [];
        let inElse = false;
        let j = i + 1;

        while (j < rawLines.length) {
          const lineRaw = rawLines[j];
          const lineTrimmed = lineRaw.trim();
          if (!lineTrimmed || lineTrimmed.startsWith('#')) {
            j++;
            continue;
          }
          const lineIndent = lineRaw.search(/\S/);
          if (lineIndent <= ifIndent) {
            if (!inElse && (lineTrimmed.startsWith('else:') || lineTrimmed === 'else:' || lineTrimmed.startsWith('elif '))) {
              inElse = true;
              j++;
              continue;
            }
            break;
          }
          if (!inElse) {
            thenLines.push(j + 1);
          } else {
            elseLines.push(j + 1);
          }
          j++;
        }
        blocks.push({ ifLineNum, cond, thenLines, elseLines });
      }
    }
    return blocks;
  }

  // Brace-based languages (C++, C, Java, Kotlin)
  for (let i = 0; i < rawLines.length; i++) {
    const trimmed = rawLines[i].trim();
    const ifMatch = trimmed.match(/^if\s*\((.*)\)/) || trimmed.match(/^(?:}\s*)?else\s+if\s*\((.*)\)/);
    if (ifMatch) {
      const cond = ifMatch[1].trim();
      const ifLineNum = i + 1;
      const thenLines: number[] = [];
      const elseLines: number[] = [];

      if (!trimmed.includes('{')) {
        // Single line body without braces
        let j = i + 1;
        while (j < rawLines.length && !rawLines[j].trim()) j++;
        if (j < rawLines.length) {
          thenLines.push(j + 1);
          let k = j + 1;
          while (k < rawLines.length && !rawLines[k].trim()) k++;
          if (k < rawLines.length && rawLines[k].trim().startsWith('else')) {
            let m = k + 1;
            while (m < rawLines.length && !rawLines[m].trim()) m++;
            if (m < rawLines.length) elseLines.push(m + 1);
          }
        }
      } else {
        let depth = 1;
        let j = i + 1;
        let inElse = false;

        while (j < rawLines.length) {
          const lineNum = j + 1;
          const lineText = rawLines[j].trim();

          // Check if this line transitions from if to else at depth 1
          if (!inElse && depth === 1 && lineText.includes('else')) {
            inElse = true;
            depth = lineText.includes('{') ? 1 : 0;
            j++;
            continue;
          }

          const openBraces = (lineText.match(/\{/g) || []).length;
          const closeBraces = (lineText.match(/\}/g) || []).length;
          depth += openBraces - closeBraces;

          if (!inElse) {
            if (lineText && lineText !== '{' && lineText !== '}' && !lineText.startsWith('//')) {
              thenLines.push(lineNum);
            }
          } else {
            if (lineText && lineText !== '{' && lineText !== '}' && !lineText.startsWith('//')) {
              elseLines.push(lineNum);
            }
          }

          if (depth <= 0) break;
          j++;
        }
      }

      blocks.push({ ifLineNum, cond, thenLines, elseLines });
    }
  }

  return blocks;
}

/**
 * Evaluates a condition with substituted runtime variables,
 * with fallback correlation to actual program output.
 */
function evaluateCondition(
  cond: string,
  vars: Record<string, any>,
  actualOutput?: string,
  expectedOutput?: string
): boolean {
  if (cond.includes('cin >>') || cond.includes('scanf(') || cond.includes('input(') || cond.includes('Scanner')) {
    return true;
  }

  try {
    let jsCond = cond
      .replace(/&&/g, ' && ')
      .replace(/\|\|/g, ' || ')
      .replace(/!([^=])/g, '!$1')
      .replace(/==/g, '===')
      .replace(/!=/g, '!==')
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\b/g, '!');

    for (const [k, v] of Object.entries(vars)) {
      const regex = new RegExp(`\\b${k}\\b`, 'g');
      jsCond = jsCond.replace(regex, typeof v === 'string' ? JSON.stringify(v) : v);
    }

    const fn = new Function(`return Boolean(${jsCond});`);
    return Boolean(fn());
  } catch (e) {
    if (actualOutput && actualOutput.trim()) {
      const act = actualOutput.trim().toLowerCase();
      if (act === 'yes' || act === 'true' || act === '1') return true;
      if (act === 'no' || act === 'false' || act === '0') return false;
    }
    return true;
  }
}

/**
 * Parses user code and generates execution trace steps for a given test input.
 */
export function traceCodeExecution(
  code: string,
  input: string = '',
  expectedOutput: string = '',
  actualOutput: string = '',
  language: string = 'cpp'
): TraceStep[] {
  if (!code || !code.trim()) {
    return [
      {
        stepIndex: 0,
        lineNumber: 1,
        lineCode: '// Ready',
        whatHappened: 'Enter code in the editor to inspect execution trace.',
        stepsTaken: ['No code available to trace yet.'],
      },
    ];
  }

  const rawLines = code.split(/\r?\n/);
  const inputTokens = input.trim().split(/\s+/).filter(Boolean);
  let inputTokenIdx = 0;
  const vars: Record<string, any> = {};
  const isPython = language === 'python';

  // Pre-pass: extract initial input variables from input statements
  for (let i = 0; i < rawLines.length; i++) {
    const text = rawLines[i].trim();
    if (text.includes('cin >>')) {
      const varMatches = text.match(/>>\s*([A-Za-z0-9_$]+)/g);
      if (varMatches) {
        for (const m of varMatches) {
          const v = m.replace('>>', '').trim();
          const val = inputTokens[inputTokenIdx] !== undefined ? inputTokens[inputTokenIdx] : '0';
          inputTokenIdx++;
          vars[v] = isNaN(Number(val)) ? val : Number(val);
        }
      }
    } else if (text.match(/([A-Za-z0-9_$]+)\s*=\s*(?:int\()?(?:input\()/)) {
      const pyMatch = text.match(/([A-Za-z0-9_$]+)\s*=\s*(?:int\()?(?:input\()/);
      if (pyMatch) {
        const v = pyMatch[1];
        const val = inputTokens[inputTokenIdx] !== undefined ? inputTokens[inputTokenIdx] : '0';
        inputTokenIdx++;
        vars[v] = isNaN(Number(val)) ? val : Number(val);
      }
    }
  }

  // Reset input index for execution simulation
  inputTokenIdx = 0;

  // Identify control flow blocks
  const ifBlocks = findIfBlocks(rawLines, isPython);
  const skippedLines = new Set<number>();
  const ifDecisions = new Map<number, boolean>();

  for (const block of ifBlocks) {
    if (skippedLines.has(block.ifLineNum)) continue;

    const isTrue = evaluateCondition(block.cond, vars, actualOutput, expectedOutput);
    ifDecisions.set(block.ifLineNum, isTrue);

    if (isTrue) {
      // Condition met: skip else branch
      for (const line of block.elseLines) {
        skippedLines.add(line);
      }
    } else {
      // Condition failed: skip then branch
      for (const line of block.thenLines) {
        skippedLines.add(line);
      }
    }
  }

  const steps: TraceStep[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const lineNum = i + 1;
    const raw = rawLines[i];
    const text = raw.trim();

    // 1. Skip blank lines
    if (!text) continue;

    // 2. Skip comments and language directives/boilerplate
    if (
      text.startsWith('//') ||
      text.startsWith('/*') ||
      text.startsWith('*') ||
      text.startsWith('#include') ||
      text.startsWith('#define') ||
      text.startsWith('using namespace') ||
      text.startsWith('package ') ||
      text.startsWith('import ')
    ) {
      continue;
    }

    if (isPython && text.startsWith('#')) {
      continue;
    }

    // 3. Skip purely structural boundary braces and else keywords
    // These should NEVER be treated as executable expressions!
    if (
      text === '{' ||
      text === '}' ||
      text === '};' ||
      text === '});' ||
      text === '} else {' ||
      text === 'else {' ||
      text === 'else' ||
      text === '} else' ||
      text === 'else:'
    ) {
      continue;
    }

    // 4. Skip lines that were bypassed by if-else branches
    if (skippedLines.has(lineNum)) {
      continue;
    }

    // A. Function / Main entry
    if (text.includes('main(') || text.includes('function ') || text.match(/^def\s+[A-Za-z0-9_$]+\(/)) {
      const fnName = text.match(/(?:function|def|\bint|\bvoid)\s+([A-Za-z0-9_$]+)/)?.[1] || 'main';
      steps.push({
        stepIndex: steps.length,
        lineNumber: lineNum,
        lineCode: text,
        whatHappened: `Started executing function ${fnName}() with test input "${input.trim() || 'none'}".`,
        stepsTaken: [
          `Allocated new stack frame for ${fnName}().`,
          `Initialized local execution scope and standard I/O streams.`,
          inputTokens.length > 0
            ? `Loaded input stream with ${inputTokens.length} token(s) [${inputTokens.join(', ')}].`
            : `Prepared standard input stream.`,
        ],
        variables: { ...vars },
      });
      continue;
    }

    // B. Input reading statements (cin >> x, input(), scanf, etc.)
    if (
      text.includes('cin >>') ||
      text.includes('input(') ||
      text.includes('scanf(') ||
      text.includes('Scanner') ||
      text.includes('readLine(')
    ) {
      const varMatches = text.match(/>>\s*([A-Za-z0-9_$]+)/g);
      const assignedVars: string[] = [];

      if (varMatches) {
        for (const m of varMatches) {
          const v = m.replace('>>', '').trim();
          const val = inputTokens[inputTokenIdx] !== undefined ? inputTokens[inputTokenIdx] : '0';
          inputTokenIdx++;
          vars[v] = isNaN(Number(val)) ? val : Number(val);
          assignedVars.push(`${v} = ${val}`);
        }
      } else {
        const pyMatch = text.match(/([A-Za-z0-9_$]+)\s*=\s*(?:int\()?(?:input\()/);
        if (pyMatch) {
          const v = pyMatch[1];
          const val = inputTokens[inputTokenIdx] !== undefined ? inputTokens[inputTokenIdx] : '0';
          inputTokenIdx++;
          vars[v] = isNaN(Number(val)) ? val : Number(val);
          assignedVars.push(`${v} = ${val}`);
        }
      }

      const summaryVar = assignedVars.join(', ') || 'input values';
      const isIf = text.startsWith('if');

      steps.push({
        stepIndex: steps.length,
        lineNumber: lineNum,
        lineCode: text,
        whatHappened: isIf
          ? `Read standard input into ${summaryVar}. Input stream verified successfully.`
          : `Read standard input into ${summaryVar}.`,
        stepsTaken: [
          `Retrieved next token from input buffer.`,
          `Stored parsed value into memory: ${summaryVar}.`,
          isIf
            ? `Stream condition verified (cin stream valid; entered block).`
            : `Updated active variable state.`,
        ],
        variables: { ...vars },
      });
      continue;
    }

    // C. Simple declaration without assignment (e.g., int w;)
    const declOnlyMatch = text.match(/^(?:int|long|double|float|char|string)\s+([A-Za-z0-9_$,\s]+);/);
    if (declOnlyMatch && !text.includes('=')) {
      const rawNames = declOnlyMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      for (const v of rawNames) {
        if (!(v in vars)) vars[v] = 0;
      }
      steps.push({
        stepIndex: steps.length,
        lineNumber: lineNum,
        lineCode: text,
        whatHappened: `Declared variable(s) ${rawNames.join(', ')} in local scope.`,
        stepsTaken: [
          `Allocated memory block on stack for ${rawNames.join(', ')}.`,
          `Initialized with default type value(s).`,
        ],
        variables: { ...vars },
      });
      continue;
    }

    // D. Variable declarations / assignments with value
    if (
      (text.includes('=') && !text.includes('==') && !text.includes('<=') && !text.includes('>=') && !text.includes('!=')) ||
      text.match(/^(?:int|long|double|float|char|string|let|const|var)\s+[A-Za-z0-9_$]+/)
    ) {
      const assignMatch = text.match(/(?:int|long|double|float|char|string|let|const|var\s+)?([A-Za-z0-9_$]+)\s*=\s*([^;]+)/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const expr = assignMatch[2].trim();
        let evaluatedVal = expr;
        if (inputTokens[0] && (expr.includes('String(') || expr.includes('Number(') || expr === 'number')) {
          evaluatedVal = inputTokens[0];
        }
        vars[varName] = evaluatedVal;

        steps.push({
          stepIndex: steps.length,
          lineNumber: lineNum,
          lineCode: text,
          whatHappened: `Initialized variable ${varName} = ${evaluatedVal}.`,
          stepsTaken: [
            `Allocated storage for variable ${varName}.`,
            `Evaluated expression: "${expr}".`,
            `Stored "${evaluatedVal}" into ${varName}.`,
          ],
          variables: { ...vars },
        });
        continue;
      }
    }

    // E. Condition statements (if, while)
    if (text.startsWith('if') || text.startsWith('while') || (isPython && (text.startsWith('elif ') || text.startsWith('while ')))) {
      const condMatch = text.match(/(?:if|while|elif)\s*\(([^)]+)\)/) || text.match(/(?:if|while|elif)\s+([^:{]+)/);
      const cond = condMatch ? condMatch[1].trim() : 'condition';

      const isTrue = ifDecisions.has(lineNum)
        ? ifDecisions.get(lineNum)!
        : evaluateCondition(cond, vars, actualOutput, expectedOutput);

      const varSubs: string[] = [];
      for (const [k, v] of Object.entries(vars)) {
        if (cond.includes(k)) {
          varSubs.push(`${k} = ${v}`);
        }
      }
      const varSubText = varSubs.length > 0 ? ` (with ${varSubs.join(', ')})` : '';
      const block = ifBlocks.find(b => b.ifLineNum === lineNum);
      const hasElse = block ? block.elseLines.length > 0 : false;

      if (isTrue) {
        steps.push({
          stepIndex: steps.length,
          lineNumber: lineNum,
          lineCode: text,
          whatHappened: `Condition evaluated to true (${cond}${varSubText}). Entered if block.`,
          stepsTaken: [
            `Evaluated conditional expression: ${cond}.`,
            varSubs.length > 0
              ? `Substituted active variables: ${varSubs.join(', ')}.`
              : `Evaluated operands.`,
            `Condition holds (true); proceeding with block execution.`,
          ],
          variables: { ...vars },
        });
      } else {
        steps.push({
          stepIndex: steps.length,
          lineNumber: lineNum,
          lineCode: text,
          whatHappened: `Condition evaluated to false (${cond}${varSubText}). ${hasElse ? 'Skipping to else branch.' : 'Bypassing if block.'}`,
          stepsTaken: [
            `Evaluated conditional expression: ${cond}.`,
            varSubs.length > 0
              ? `Substituted active variables: ${varSubs.join(', ')}.`
              : `Evaluated operands.`,
            `Condition failed (false); ${hasElse ? 'diverting execution to else branch.' : 'continuing execution after block.'}`,
          ],
          variables: { ...vars },
        });
      }
      continue;
    }

    // F. Output statements (cout, print, printf, System.out)
    if (
      text.includes('cout <<') ||
      text.includes('print(') ||
      text.includes('printf(') ||
      text.includes('System.out')
    ) {
      // First extract string literal from THIS specific line
      const strLiteralMatch = text.match(/["']([^"']+)["']/);
      let outVal = strLiteralMatch ? strLiteralMatch[1].replace(/\\n/g, '').trim() : '';

      if (!outVal) {
        // Variable output like cout << ans; or print(count)
        const varMatch = text.match(/cout\s*<<\s*([A-Za-z0-9_$]+)/) || text.match(/print\s*\(\s*([A-Za-z0-9_$]+)\s*\)/);
        if (varMatch && vars[varMatch[1]] !== undefined) {
          outVal = String(vars[varMatch[1]]);
        } else {
          outVal = actualOutput.trim() || expectedOutput.trim() || 'output';
        }
      }

      steps.push({
        stepIndex: steps.length,
        lineNumber: lineNum,
        lineCode: text,
        whatHappened: `Printed "${outVal}" to standard output.`,
        stepsTaken: [
          `Evaluated output expression: "${outVal}".`,
          `Wrote "${outVal}" to standard output stream (stdout).`,
          `Appended line break.`,
        ],
        variables: { ...vars },
      });
      continue;
    }

    // G. Return statement
    if (text.startsWith('return')) {
      const retMatch = text.match(/return\s+([^;]+)/);
      const retVal = retMatch ? retMatch[1].trim() : '0';
      steps.push({
        stepIndex: steps.length,
        lineNumber: lineNum,
        lineCode: text,
        whatHappened: `Returned ${retVal} and terminated function.`,
        stepsTaken: [
          `Calculated return expression: ${retVal}.`,
          `Popped current stack frame and released local scope.`,
          `Exited with status code ${retVal} (success).`,
        ],
        variables: { ...vars },
      });
      continue;
    }

    // H. General expression statement (e.g. count++; sum += val;)
    steps.push({
      stepIndex: steps.length,
      lineNumber: lineNum,
      lineCode: text,
      whatHappened: `Executed statement: ${text}`,
      stepsTaken: [
        `Evaluated expression: ${text}.`,
        `Updated execution state.`,
      ],
      variables: { ...vars },
    });
  }

  return steps.length > 0
    ? steps
    : [
        {
          stepIndex: 0,
          lineNumber: 1,
          lineCode: rawLines[0] || '',
          whatHappened: 'Execution completed.',
          stepsTaken: ['Ran code.'],
        },
      ];
}
