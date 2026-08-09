/**
 * Scientific calculator engine — a tokenizer + shunting-yard parser + RPN
 * evaluator. No `eval`, so malformed input degrades to a friendly error.
 */

export type AngleMode = "deg" | "rad";

type Token =
  | { type: "num"; value: number }
  | { type: "unary"; op: "-" }
  | { type: "op"; op: string }
  | { type: "func"; name: string }
  | { type: "postfix"; op: "%" | "!" }
  | { type: "lparen" }
  | { type: "rparen" };

const CONSTANTS: Record<string, number> = { π: Math.PI, e: Math.E };
const FUNCTIONS = new Set(["sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "sqrt"]);

const PRECEDENCE: Record<string, number> = {
  "+": 1,
  "-": 1,
  "×": 2,
  "÷": 2,
  "^": 3,
  unary: 4,
  postfix: 5,
};

const RIGHT_ASSOC = new Set(["-" /* unary */, "^"]);

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const prevToken = () => tokens[tokens.length - 1];
  const needsBinary = () => {
    const prev = prevToken();
    if (!prev) return false;
    if (prev.type === "num" || prev.type === "rparen" || prev.type === "postfix") return true;
    return false;
  };

  while (i < expr.length) {
    const ch = expr[i];
    const rest = expr.slice(i);

    if (ch === " ") {
      i++;
      continue;
    }

    // number
    if (/[0-9.]/.test(ch)) {
      const m = /^(\d+\.?\d*|\.\d+)/.exec(rest);
      if (!m) throw new Error("bad number");
      tokens.push({ type: "num", value: Number(m[0]) });
      i += m[0].length;
      continue;
    }

    // constants
    if (CONSTANTS[ch]) {
      if (needsBinary()) throw new Error("missing operator");
      tokens.push({ type: "num", value: CONSTANTS[ch] });
      i++;
      continue;
    }

    // multi-char functions
    const fn = /^(sin|cos|tan|asin|acos|atan|log|ln|sqrt)/.exec(rest)?.[0];
    if (fn) {
      if (needsBinary()) throw new Error("missing operator");
      tokens.push({ type: "func", name: fn });
      i += fn.length;
      continue;
    }

    switch (ch) {
      case "+":
      case "×":
      case "÷":
      case "^":
        if (!needsBinary()) {
          if (ch !== "+") throw new Error("missing operand");
          // bare leading "+" is a no-op
        } else {
          tokens.push({ type: "op", op: ch });
        }
        i++;
        break;
      case "-": {
        const unary = !needsBinary();
        tokens.push({ type: unary ? "unary" : "op", op: "-" });
        i++;
        break;
      }
      case "%":
      case "!":
        tokens.push({ type: "postfix", op: ch });
        i++;
        break;
      case "(":
        if (needsBinary() && prevToken().type !== "func") throw new Error("missing operator");
        tokens.push({ type: "lparen" });
        i++;
        break;
      case ")": {
        let depth = 1;
        for (let j = tokens.length - 1; j >= 0; j--) {
          if (tokens[j].type === "rparen") depth++;
          else if (tokens[j].type === "lparen") depth--;
          if (depth === 0) break;
        }
        if (depth !== 0) throw new Error("unmatched )");
        tokens.push({ type: "rparen" });
        i++;
        break;
      }
      default:
        throw new Error(`unknown symbol ${ch}`);
    }
  }

  return tokens;
}

type OpToken = { type: "op"; op: string } | { type: "unary"; op: "-" } | { type: "func"; name: string } | { type: "lparen" };

function toRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const ops: OpToken[] = [];

  const popHigher = (prec: number, rightAssoc: boolean) => {
    while (ops.length) {
      const top = ops[ops.length - 1];
      if (top.type === "lparen" || top.type === "func") break;
      const topPrec = top.type === "unary" ? PRECEDENCE.unary : PRECEDENCE[top.op];
      if (topPrec > prec || (topPrec === prec && !rightAssoc)) {
        ops.pop();
        output.push(top);
      } else break;
    }
  };

  for (const token of tokens) {
    switch (token.type) {
      case "num":
        output.push(token);
        break;
      case "postfix":
        // postfix operators bind tightly to whatever precedes them in RPN
        output.push(token);
        break;
      case "unary":
        popHigher(PRECEDENCE.unary, true);
        ops.push(token);
        break;
      case "op":
        popHigher(PRECEDENCE[token.op], RIGHT_ASSOC.has(token.op));
        ops.push(token);
        break;
      case "func":
        ops.push(token);
        break;
      case "lparen":
        ops.push(token);
        break;
      case "rparen":
        while (ops.length) {
          const top = ops.pop()!;
          if (top.type === "lparen") break;
          output.push(top);
        }
        break;
    }
  }

  while (ops.length) {
    const top = ops.pop()!;
    if (top.type === "lparen") throw new Error("unmatched (");
    output.push(top);
  }

  return output;
}

const DEG = Math.PI / 180;

function applyFn(name: string, x: number, mode: AngleMode): number {
  const rad = mode === "deg" ? x * DEG : x;
  switch (name) {
    case "sin":
      return Math.sin(rad);
    case "cos":
      return Math.cos(rad);
    case "tan":
      return Math.tan(rad);
    case "asin":
      if (x < -1 || x > 1) throw new Error("asin domain");
      return mode === "deg" ? Math.asin(x) / DEG : Math.asin(x);
    case "acos":
      if (x < -1 || x > 1) throw new Error("acos domain");
      return mode === "deg" ? Math.acos(x) / DEG : Math.acos(x);
    case "atan":
      return mode === "deg" ? Math.atan(x) / DEG : Math.atan(x);
    case "log":
      if (x <= 0) throw new Error("log domain");
      return Math.log10(x);
    case "ln":
      if (x <= 0) throw new Error("ln domain");
      return Math.log(x);
    case "sqrt":
      if (x < 0) throw new Error("sqrt domain");
      return Math.sqrt(x);
    default:
      throw new Error(`unknown function ${name}`);
  }
}

function evaluateRpn(tokens: Token[], mode: AngleMode): number {
  const stack: number[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case "num":
        stack.push(token.value);
        break;
      case "unary": {
        if (stack.length < 1) throw new Error("not enough operands");
        stack.push(-stack.pop()!);
        break;
      }
      case "op": {
        if (stack.length < 2) throw new Error("not enough operands");
        const b = stack.pop()!;
        const a = stack.pop()!;
        switch (token.op) {
          case "+":
            stack.push(a + b);
            break;
          case "-":
            stack.push(a - b);
            break;
          case "×":
            stack.push(a * b);
            break;
          case "÷":
            if (b === 0) throw new Error("divide by zero");
            stack.push(a / b);
            break;
          case "^":
            if (a < 0 && !Number.isInteger(b)) throw new Error("complex result");
            stack.push(Math.pow(a, b));
            break;
        }
        break;
      }
      case "func": {
        if (stack.length < 1) throw new Error("not enough operands");
        stack.push(applyFn(token.name, stack.pop()!, mode));
        break;
      }
      case "postfix": {
        if (stack.length < 1) throw new Error("not enough operands");
        const x = stack.pop()!;
        if (token.op === "%") {
          stack.push(x / 100);
        } else {
          if (!Number.isInteger(x) || x < 0) throw new Error("factorial needs non-negative integer");
          let result = 1;
          for (let n = x; n > 1; n--) result *= n;
          stack.push(result);
        }
        break;
      }
      default:
        throw new Error("unexpected token");
    }
  }
  if (stack.length !== 1) throw new Error("incomplete expression");
  const value = stack[0];
  if (!Number.isFinite(value)) throw new Error("not a number");
  return value;
}

/** Format results compactly: up to 10 significant digits, no trailing zeros. */
export function formatResult(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) return value.toExponential(6).replace(/\.?0+e/, "e");
  return String(parseFloat(value.toPrecision(10)));
}

export function evaluateExpression(expr: string, mode: AngleMode): number {
  return evaluateRpn(toRpn(tokenize(expr)), mode);
}

export function isCompleteExpression(expr: string): boolean {
  try {
    tokenize(expr);
    return true;
  } catch {
    return false;
  }
}
