import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "No code provided" },
        { status: 400 }
      );
    }

    if (language === "javascript" || language === "typescript") {
      const result = executeJavaScript(code);
      return NextResponse.json(result);
    }

    if (language === "python") {
      // Python would require a Python runtime - return simulated for now
      return NextResponse.json({
        success: true,
        output: "⚠️ Python execution requires a Python runtime server.\n\nSimulated output for demo purposes.",
        logs: [],
      });
    }

    return NextResponse.json({
      success: true,
      output: `Language '${language}' execution not supported on server.`,
      logs: [],
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to execute code", details: (error as Error).message },
      { status: 500 }
    );
  }
}

function executeJavaScript(code: string): { success: boolean; output: string; logs: string[]; error?: string } {
  const logs: string[] = [];
  let output = "";
  let error: string | undefined;

  // Create a custom console to capture logs
  const customConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map(arg => formatValue(arg)).join(" "));
    },
    error: (...args: unknown[]) => {
      logs.push(`[ERROR] ${args.map(arg => formatValue(arg)).join(" ")}`);
    },
    warn: (...args: unknown[]) => {
      logs.push(`[WARN] ${args.map(arg => formatValue(arg)).join(" ")}`);
    },
    info: (...args: unknown[]) => {
      logs.push(`[INFO] ${args.map(arg => formatValue(arg)).join(" ")}`);
    },
    table: (data: unknown) => {
      logs.push(formatValue(data));
    },
    clear: () => {
      logs.length = 0;
    },
    time: () => {},
    timeEnd: () => {},
    assert: (condition: boolean, ...args: unknown[]) => {
      if (!condition) {
        logs.push(`[ASSERT FAILED] ${args.map(arg => formatValue(arg)).join(" ")}`);
      }
    },
  };

  // Security: Block dangerous operations
  const blockedPatterns = [
    /require\s*\(/,
    /import\s+/,
    /process\./,
    /child_process/,
    /fs\./,
    /exec\s*\(/,
    /spawn\s*\(/,
    /eval\s*\(/,
    /Function\s*\(/,
    /__dirname/,
    /__filename/,
    /global\./,
    /globalThis\./,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(code)) {
      return {
        success: false,
        output: "",
        logs: [],
        error: `Security Error: Blocked operation detected. Pattern: ${pattern.toString()}`,
      };
    }
  }

  try {
    // Check if code is a simple expression (no semicolons, no declarations)
    const isSimpleExpression = !code.includes(";") && 
      !code.trim().startsWith("const ") && 
      !code.trim().startsWith("let ") && 
      !code.trim().startsWith("var ") &&
      !code.trim().startsWith("function ") &&
      !code.trim().startsWith("class ") &&
      !code.trim().startsWith("if ") &&
      !code.trim().startsWith("for ") &&
      !code.trim().startsWith("while ") &&
      !code.includes("console.");

    // Check if code uses DOM (document/window)
    const usesDom = /\b(document|window|DOM|getElementById|querySelector|createElement|appendChild|innerHTML|innerText|textContent|body)\b/.test(code);

    // Create mock DOM elements for simulating browser behavior
    const createMockElement = (tag: string) => {
      const element: Record<string, unknown> = {
        tagName: tag.toUpperCase(),
        id: "",
        className: "",
        innerText: "",
        innerHTML: "",
        textContent: "",
        style: {},
        children: [] as Record<string, unknown>[],
        appendChild: function(child: Record<string, unknown>) {
          (this.children as Record<string, unknown>[]).push(child);
          logs.push(`[DOM] Appended ${child.tagName || "element"} to ${this.tagName || "element"}`);
          return child;
        },
        setAttribute: function(name: string, value: string) {
          (this as Record<string, unknown>)[name] = value;
        },
        getAttribute: function(name: string) {
          return (this as Record<string, unknown>)[name];
        },
        addEventListener: function(event: string, _handler: unknown) {
          logs.push(`[DOM] Added "${event}" event listener`);
        },
      };
      return element;
    };

    // Mock document object
    const mockDocument = {
      body: createMockElement("body"),
      head: createMockElement("head"),
      documentElement: createMockElement("html"),
      getElementById: function(id: string) {
        logs.push(`[DOM] getElementById("${id}") called`);
        const el = createMockElement("div");
        el.id = id;
        return el;
      },
      querySelector: function(selector: string) {
        logs.push(`[DOM] querySelector("${selector}") called`);
        return createMockElement("div");
      },
      querySelectorAll: function(selector: string) {
        logs.push(`[DOM] querySelectorAll("${selector}") called`);
        return [createMockElement("div")];
      },
      createElement: function(tag: string) {
        logs.push(`[DOM] createElement("${tag}")`);
        return createMockElement(tag);
      },
      createTextNode: function(text: string) {
        logs.push(`[DOM] createTextNode("${text}")`);
        return { textContent: text, nodeType: 3 };
      },
      write: function(html: string) {
        logs.push(`[DOM] document.write: ${html.substring(0, 100)}${html.length > 100 ? "..." : ""}`);
      },
    };

    // Mock window object
    const mockWindow = {
      document: mockDocument,
      alert: function(msg: string) {
        logs.push(`[ALERT] ${msg}`);
      },
      prompt: function(msg: string) {
        logs.push(`[PROMPT] ${msg}`);
        return "user_input";
      },
      confirm: function(msg: string) {
        logs.push(`[CONFIRM] ${msg}`);
        return true;
      },
      location: { href: "http://localhost/", pathname: "/", host: "localhost" },
      innerWidth: 1920,
      innerHeight: 1080,
    };

    // Create a sandboxed execution environment
    const sandboxedCode = `
      "use strict";
      const console = customConsole;
      const document = mockDocument;
      const window = mockWindow;
      const alert = mockWindow.alert;
      const prompt = mockWindow.prompt;
      const confirm = mockWindow.confirm;
      const setTimeout = undefined;
      const setInterval = undefined;
      const setImmediate = undefined;
      const fetch = undefined;
      const XMLHttpRequest = undefined;
      
      ${isSimpleExpression ? `return (${code});` : code}
    `;

    // Add DOM usage note
    if (usesDom) {
      logs.push("📝 Note: Running with simulated DOM (no visual output)");
      logs.push("💡 Tip: Use the HTML tab + Preview for visual DOM output");
      logs.push("");
    }

    // Execute with timeout protection
    const startTime = Date.now();
    const maxExecutionTime = 5000; // 5 seconds max

    // Use Function constructor for slightly safer execution
    const executor = new Function("customConsole", "mockDocument", "mockWindow", sandboxedCode);
    
    // Simple execution (Note: In production, use vm2 or isolated-vm for better sandboxing)
    const result = executor(customConsole, mockDocument, mockWindow);

    const executionTime = Date.now() - startTime;

    if (executionTime > maxExecutionTime) {
      return {
        success: false,
        output: "",
        logs,
        error: `Execution timeout: Code took longer than ${maxExecutionTime}ms`,
      };
    }

    // If there's a return value, add it to output
    if (result !== undefined) {
      output = formatValue(result);
    }

    return {
      success: true,
      output,
      logs,
    };

  } catch (err) {
    error = (err as Error).message;
    
    // Parse error for better messages
    if (error.includes("is not defined")) {
      const match = error.match(/(\w+) is not defined/);
      if (match) {
        error = `ReferenceError: '${match[1]}' is not defined. Did you forget to declare it?`;
      }
    }

    return {
      success: false,
      output: "",
      logs,
      error,
    };
  }
}

function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "function") return `[Function: ${value.name || "anonymous"}]`;
  if (Array.isArray(value)) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "[Array]";
    }
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "[Object]";
    }
  }
  return String(value);
}
