"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { usePyodide } from "../hooks/usePyodide";

// Helper function to strip TypeScript types for browser execution
const stripTypeScript = (code: string): string => {
  return code
    // Remove type annotations from variables: const x: string = -> const x =
    .replace(/:\s*[A-Za-z<>\[\]|&(),\s\?]+(?=\s*=)/g, '')
    // Remove type annotations from function parameters: (x: string) -> (x)
    .replace(/(\w+)\s*:\s*[A-Za-z<>\[\]|&(),\s\?]+(?=[,\)])/g, '$1')
    // Remove return type annotations: ): string => -> ) =>
    .replace(/\)\s*:\s*[A-Za-z<>\[\]|&(),\s\?]+(?=\s*=>)/g, ')')
    // Remove return type annotations: ): string { -> ) {
    .replace(/\)\s*:\s*[A-Za-z<>\[\]|&(),\s\?]+(?=\s*\{)/g, ')')
    // Remove interface declarations
    .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
    // Remove type declarations
    .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
    // Remove generic type parameters from function calls: func<string>() -> func()
    .replace(/<[A-Za-z<>\[\]|&(),\s\?]+>(?=\()/g, '')
    // Remove 'as' type assertions: x as string -> x
    .replace(/\s+as\s+[A-Za-z<>\[\]|&(),\s\?]+/g, '')
    // Remove non-null assertions: x! -> x
    .replace(/!(?=[\.\;\)\]\s])/g, '')
    // Clean up empty lines
    .replace(/^\s*[\r\n]/gm, '');
};

interface UserData {
  firstName: string;
  lastName: string;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  codeUpdate?: string; // Code that can be auto-applied
  codePreview?: string; // Code preview shown to user before applying
}

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  duration?: number;
}

export default function CodePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Pyodide for Python execution
  const { isLoading: isPyodideLoading, isReady: isPyodideReady, loadPyodide, runPython } = usePyodide();
  const [code, setCode] = useState(`// JavaScript - Hello World
console.log("Hello, World!");
`);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [savedCodes, setSavedCodes] = useState<{ [key: string]: string }>({});
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi! I'm your AI coding assistant. I can help you with:\n\n• Writing and debugging code\n• Explaining programming concepts\n• Suggesting improvements\n• Answering questions\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [files, setFiles] = useState<CodeFile[]>([
    { id: "1", name: "main.js", language: "javascript", content: code },
  ]);
  const [activeFileId, setActiveFileId] = useState("1");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "Welcome to Wayvian Terminal v1.0.0",
    "Type 'help' for available commands.",
    "",
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [freeformLanguage, setFreeformLanguage] = useState("javascript");
  const [isLanguageIndicatorOpen, setIsLanguageIndicatorOpen] = useState(false);
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("userData") || "null");
    if (!savedData) {
      router.push("/login");
      return;
    }
    setUserData(savedData);
    
    // Load saved codes from localStorage
    const savedCodesData = JSON.parse(localStorage.getItem("savedCodes") || "{}");
    if (Object.keys(savedCodesData).length > 0) {
      setSavedCodes(savedCodesData);
      // Load the saved code for current language if it exists
      if (savedCodesData[selectedLanguage]) {
        setCode(savedCodesData[selectedLanguage]);
      }
    }
  }, [router]);

  // Save codes to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(savedCodes).length > 0) {
      localStorage.setItem("savedCodes", JSON.stringify(savedCodes));
    }
  }, [savedCodes]);

  // Auto-save current code periodically
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      setSavedCodes(prev => ({
        ...prev,
        [selectedLanguage]: code,
      }));
    }, 1000); // Save after 1 second of no typing
    
    return () => clearTimeout(saveTimer);
  }, [code, selectedLanguage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { id: "javascript", name: "JavaScript", icon: "🟨" },
    { id: "python", name: "Python", icon: "🐍" },
    { id: "html", name: "HTML", icon: "🌐" },
    { id: "css", name: "CSS", icon: "🎨" },
    { id: "typescript", name: "TypeScript", icon: "🔷" },
    { id: "freeform", name: "Freeform", icon: "🆓" },
  ];

  // Languages available for freeform mode indicator
  const freeformLanguages = [
    { id: "javascript", name: "JavaScript", icon: "🟨" },
    { id: "python", name: "Python", icon: "🐍" },
    { id: "html", name: "HTML", icon: "🌐" },
    { id: "css", name: "CSS", icon: "🎨" },
    { id: "typescript", name: "TypeScript", icon: "🔷" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "csharp", name: "C#", icon: "#️⃣" },
    { id: "cpp", name: "C++", icon: "⚙️" },
    { id: "ruby", name: "Ruby", icon: "💎" },
    { id: "go", name: "Go", icon: "🐹" },
    { id: "rust", name: "Rust", icon: "🦀" },
    { id: "php", name: "PHP", icon: "🐘" },
    { id: "sql", name: "SQL", icon: "🗃️" },
    { id: "json", name: "JSON", icon: "📋" },
    { id: "markdown", name: "Markdown", icon: "📝" },
    { id: "other", name: "Other", icon: "📄" },
  ];

  const codeTemplates: { [key: string]: string } = {
    javascript: `// JavaScript - Hello World
console.log("Hello, World!");`,
    python: `# Python - Hello World
print("Hello, World!")`,
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Hello World</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>`,
    css: `/* CSS - Hello World */
body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  font-family: Arial, sans-serif;
  background: #667eea;
}

h1 {
  color: white;
  font-size: 3rem;
}`,
    typescript: `// TypeScript - Hello World
const message: string = "Hello, World!";
console.log(message);`,
    freeform: `// Freeform Code Editor
// Write any code here - select your language below
// The AI will help based on the language you select

console.log("Hello, World!");`,
  };

  // Get the effective language for AI (freeform uses its sub-language)
  const getEffectiveLanguage = () => {
    if (selectedLanguage === "freeform") {
      return freeformLanguage;
    }
    return selectedLanguage;
  };

  // Notification system
  const showNotification = useCallback((type: Notification["type"], title: string, message: string, duration = 3000) => {
    const id = Date.now().toString();
    const newNotification: Notification = { id, type, title, message, duration };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    
    // Helper function to send errors to terminal
    const sendErrorToTerminal = (errorMessage: string) => {
      setTerminalHistory(prev => [
        ...prev,
        `❌ ${errorMessage}`,
        "",
      ]);
      setActiveTab("terminal");
    };

    // Determine effective language for execution
    const effectiveLang = selectedLanguage === "freeform" ? freeformLanguage : selectedLanguage;
    
    try {
      if (effectiveLang === "javascript" || effectiveLang === "typescript" || selectedLanguage === "freeform") {
        // Call the API to execute code server-side (freeform defaults to JS execution)
        const response = await fetch("/api/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: effectiveLang === "typescript" 
              ? code.replace(/:\s*(string|number|boolean|any|void|object|\w+\[\]|{\s*\w+.*})\s*/g, " ") // Strip TypeScript types for execution
              : code,
            language: "javascript",
          }),
        });

        const result = await response.json();

        if (result.error) {
          sendErrorToTerminal(`Error: ${result.error}${result.details ? `\n${result.details}` : ""}`);
          setOutput("");
          showNotification("error", "❌ Error", "Code execution failed. Check terminal for details.");
        } else if (result.success) {
          const outputLines: string[] = [];
          
          if (result.logs && result.logs.length > 0) {
            outputLines.push(...result.logs);
          }
          
          if (result.output) {
            if (result.logs && result.logs.length > 0) {
              outputLines.push(""); // Empty line separator
              outputLines.push(`→ ${result.output}`);
            } else {
              outputLines.push(result.output);
            }
          }
          
          setOutput(outputLines.length > 0 ? outputLines.join("\n") : "✅ Code executed successfully (no output)");
          showNotification("success", "✅ Success", `${selectedLanguage === "typescript" ? "TypeScript" : "JavaScript"} code ran successfully!`);
        } else {
          sendErrorToTerminal(result.error || "Execution failed");
          setOutput("");
          showNotification("error", "❌ Error", "Code execution failed.");
        }
      } else if (selectedLanguage === "python") {
        // Use Pyodide for Python execution
        if (!isPyodideReady) {
          setOutput("🐍 Loading Python runtime...\n\nThis may take a few seconds on first run.");
          await loadPyodide();
          setOutput("✅ Python runtime loaded! Click 'Run Code' again to execute.");
          setIsRunning(false);
          return;
        }
        
        const result = await runPython(code);
        
        if (result.success) {
          setOutput(result.output);
          showNotification("success", "✅ Success", "Python code ran successfully!");
        } else {
          sendErrorToTerminal(`Python Error:\n${result.error}`);
          setOutput("");
          showNotification("error", "❌ Error", "Python code failed. Check terminal for details.");
        }
      } else if (selectedLanguage === "html") {
        setOutput("✅ HTML is valid!\n\nTo preview, use the Preview tab.");
        showNotification("success", "✅ Valid HTML", "Your HTML code is valid! Check Preview tab.");
      } else if (selectedLanguage === "css") {
        setOutput("✅ CSS parsed successfully!\n\nTo preview, use the Preview tab.");
        showNotification("success", "✅ Valid CSS", "Your CSS code is valid! Check Preview tab.");
      }
    } catch (err: unknown) {
      const error = err as Error;
      sendErrorToTerminal(`Error: ${error.message}`);
      setOutput("");
      showNotification("error", "❌ Error", "Something went wrong. Check terminal.");
    }
    
    setIsRunning(false);
  };

  const handleLanguageChange = (langId: string) => {
    // Save current code before switching
    setSavedCodes(prev => ({
      ...prev,
      [selectedLanguage]: code,
    }));
    
    // Switch to new language
    setSelectedLanguage(langId);
    
    // Load saved code for this language, or use template if no saved code
    setCode(savedCodes[langId] || codeTemplates[langId] || "");
    setOutput("");
    setIsLanguageDropdownOpen(false);
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput("");
    setIsAiTyping(true);

    try {
      // Call the OpenAI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...chatMessages, { role: "user", content: currentInput }].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          code: code,
          language: getEffectiveLanguage(),
        }),
      });

      const result = await response.json();

      let responseContent: string;
      let codeUpdate: string | undefined;
      let codePreview: string | undefined;
      
      if (result.success && result.message) {
        responseContent = result.message;
        
        // Check for code update tags (auto-apply)
        const codeUpdateMatch = responseContent.match(/\[CODE_UPDATE\]([\s\S]*?)\[\/CODE_UPDATE\]/);
        if (codeUpdateMatch) {
          codeUpdate = codeUpdateMatch[1].trim();
          // Remove the code tags from displayed content
          responseContent = responseContent.replace(/\[CODE_UPDATE\][\s\S]*?\[\/CODE_UPDATE\]/, "").trim();
        }
        
        // Check for code preview tags (show but don't auto-apply)
        const codePreviewMatch = responseContent.match(/\[CODE_PREVIEW\]([\s\S]*?)\[\/CODE_PREVIEW\]/);
        if (codePreviewMatch) {
          codePreview = codePreviewMatch[1].trim();
          // Remove the preview tags and replace with styled code display
          responseContent = responseContent.replace(
            /\[CODE_PREVIEW\]([\s\S]*?)\[\/CODE_PREVIEW\]/,
            ''
          ).trim();
        }
        
        // Check for highlight lines tags (scan feature)
        const highlightMatch = responseContent.match(/\[HIGHLIGHT_LINES\]([\d,\s]+)\[\/HIGHLIGHT_LINES\]/);
        if (highlightMatch) {
          const lineNumbers = highlightMatch[1].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
          setHighlightedLines(lineNumbers);
          setActiveTab("editor"); // Switch to editor to show highlights
          // Remove the highlight tags from displayed content
          responseContent = responseContent.replace(/\[HIGHLIGHT_LINES\][\d,\s]+\[\/HIGHLIGHT_LINES\]/, "").trim();
          showNotification("info", "🔍 Lines Highlighted", `Lines ${lineNumbers.join(', ')} are now highlighted in your editor!`);
        }
      } else {
        // Fallback responses if API fails
        responseContent = result.error 
          ? `Sorry, I encountered an error: ${result.error}. Please try again.`
          : "I'm having trouble connecting right now. Please try again in a moment.";
      }

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        codeUpdate: codeUpdate,
        codePreview: codePreview,
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please check your internet connection and try again.",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Apply code update from AI
  const applyCodeUpdate = (newCode: string, messageId: number) => {
    setCode(newCode);
    // Also save to savedCodes so it persists
    setSavedCodes(prev => ({
      ...prev,
      [selectedLanguage]: newCode,
    }));
    showNotification("success", "✅ Code Updated", "AI changes applied to your editor!");
    // Mark the code as applied by removing codeUpdate and codePreview from the message
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, codeUpdate: undefined, codePreview: undefined } : msg
    ));
    setActiveTab("editor");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Syntax highlighting function
  const highlightCode = (code: string, language: string): string => {
    // First escape HTML entities
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Use placeholder tokens to protect already-highlighted content
    const tokens: string[] = [];
    const tokenize = (match: string, className: string): string => {
      const token = `__TOKEN_${tokens.length}__`;
      tokens.push(`<span class="${className}">${match}</span>`);
      return token;
    };

    if (language === "javascript" || language === "typescript") {
      // 1. Comments first (highest priority - won't be re-processed)
      highlighted = highlighted.replace(/(\/\/.*$)/gm, (m) => tokenize(m, "comment"));
      highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, (m) => tokenize(m, "comment"));
      // 2. Strings
      highlighted = highlighted.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, (m) => tokenize(m, "string"));
      // 3. Keywords
      highlighted = highlighted.replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|typeof|instanceof)\b/g, (m) => tokenize(m, "keyword"));
      // 4. Numbers
      highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, (m) => tokenize(m, "number"));
      // 5. Functions
      highlighted = highlighted.replace(/\b([a-zA-Z_]\w*)\s*\(/g, (m, name) => tokenize(name, "function") + "(");
    } else if (language === "python") {
      // 1. Comments
      highlighted = highlighted.replace(/(#.*$)/gm, (m) => tokenize(m, "comment"));
      // 2. Strings
      highlighted = highlighted.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (m) => tokenize(m, "string"));
      // 3. Keywords
      highlighted = highlighted.replace(/\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|and|or|not|in|is|True|False|None|print)\b/g, (m) => tokenize(m, "keyword"));
      // 4. Numbers
      highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, (m) => tokenize(m, "number"));
      // 5. Functions
      highlighted = highlighted.replace(/\b([a-zA-Z_]\w*)\s*\(/g, (m, name) => tokenize(name, "function") + "(");
    } else if (language === "html") {
      // 1. Comments
      highlighted = highlighted.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (m) => tokenize(m, "comment"));
      // 2. Strings in attributes (before tag processing)
      highlighted = highlighted.replace(/(["'])(?:(?!\1)[^\\]|\\.)*\1/g, (m) => tokenize(m, "string"));
      // 3. Tags
      highlighted = highlighted.replace(/(&lt;\/?)([\w-]+)/g, (m, bracket, tag) => bracket + tokenize(tag, "tag"));
      // 4. Attributes
      highlighted = highlighted.replace(/\s([\w-]+)(=)/g, (m, attr, eq) => " " + tokenize(attr, "attribute") + eq);
    } else if (language === "css") {
      // 1. Comments
      highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, (m) => tokenize(m, "comment"));
      // 2. Selectors (before opening brace)
      highlighted = highlighted.replace(/^([^{]+)({)/gm, (m, selector, brace) => tokenize(selector.trim(), "selector") + " " + brace);
      // 3. Properties
      highlighted = highlighted.replace(/([\w-]+)\s*(:)/g, (m, prop, colon) => tokenize(prop, "property") + colon);
      // 4. Values
      highlighted = highlighted.replace(/(:\s*)([^;{}]+)(;?)/g, (m, colon, value, semi) => colon + tokenize(value.trim(), "value") + semi);
    }

    // Restore all tokens
    tokens.forEach((replacement, i) => {
      highlighted = highlighted.replace(`__TOKEN_${i}__`, replacement);
    });

    return highlighted;
  };

  // Highlight code with specific lines highlighted (for AI scan feature)
  const highlightCodeWithHighlights = (code: string, language: string, linesToHighlight: number[]): string => {
    const highlighted = highlightCode(code, language);
    
    if (linesToHighlight.length === 0) {
      return highlighted;
    }
    
    // Wrap highlighted lines in a highlight span
    const lines = highlighted.split('\n');
    const wrappedLines = lines.map((line, index) => {
      const lineNum = index + 1;
      if (linesToHighlight.includes(lineNum)) {
        return `<span class="ai-highlighted-line">${line}</span>`;
      }
      return line;
    });
    
    return wrappedLines.join('\n');
  };

  // Execute Node.js code via API for terminal
  const executeNodeCommand = async (jsCode: string) => {
    setTerminalHistory(prev => [...prev, `$ node ${jsCode}`, "Executing..."]);
    
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: jsCode, language: "javascript" }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        setTerminalHistory(prev => {
          const updated = [...prev];
          updated.pop(); // Remove "Executing..."
          return [...updated, `Error: ${result.error}`, ""];
        });
      } else {
        const outputLines: string[] = [];
        if (result.logs && result.logs.length > 0) {
          outputLines.push(...result.logs);
        }
        if (result.output) {
          outputLines.push(result.output);
        }
        
        setTerminalHistory(prev => {
          const updated = [...prev];
          updated.pop(); // Remove "Executing..."
          return [...updated, ...(outputLines.length > 0 ? outputLines : ["undefined"]), ""];
        });
      }
    } catch (err) {
      setTerminalHistory(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, `Error: ${(err as Error).message}`, ""];
      });
    }
    
    setCommandHistory(prev => [...prev, `node ${jsCode}`]);
  };

  // Execute Python code via Pyodide for terminal
  const executePythonCommand = async (pythonCode: string) => {
    setTerminalHistory(prev => [...prev, `$ python ${pythonCode}`]);
    
    if (!isPyodideReady) {
      setTerminalHistory(prev => [...prev, "Loading Python runtime...", ""]);
      await loadPyodide();
      setTerminalHistory(prev => [...prev, "✅ Python ready! Run the command again.", ""]);
      setCommandHistory(prev => [...prev, `python ${pythonCode}`]);
      return;
    }
    
    setTerminalHistory(prev => [...prev, ">>> Executing..."]);
    
    try {
      const result = await runPython(pythonCode);
      
      setTerminalHistory(prev => {
        const updated = [...prev];
        updated.pop(); // Remove ">>> Executing..."
        if (result.success) {
          const lines = result.output.split("\n").filter(line => line !== "Code executed successfully (no output)");
          return [...updated, ...(lines.length > 0 ? lines : ["None"]), ""];
        } else {
          return [...updated, `Error: ${result.error}`, ""];
        }
      });
    } catch (err) {
      setTerminalHistory(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, `Error: ${(err as Error).message}`, ""];
      });
    }
    
    setCommandHistory(prev => [...prev, `python ${pythonCode}`]);
  };

  const clearOutput = () => setOutput("");
  const clearChat = () => {
    setChatMessages([{
      id: 1,
      role: "assistant",
      content: "Chat cleared! How can I help you?",
      timestamp: new Date(),
    }]);
  };

  // Terminal functions
  const executeTerminalCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    const args = cmd.trim().split(" ");
    const mainCmd = args[0].toLowerCase();
    
    let response: string[] = [];
    
    switch (mainCmd) {
      case "help":
        response = [
          "Available commands:",
          "  help          - Show this help message",
          "  clear         - Clear terminal",
          "  run           - Run the current code",
          "  echo [text]   - Print text",
          "  date          - Show current date/time",
          "  whoami        - Show current user",
          "  ls            - List files",
          "  pwd           - Print working directory",
          "  cat [file]    - Show file contents",
          "  node [code]   - Execute JavaScript",
          "  python [code] - Execute Python",
          "  version       - Show version info",
        ];
        break;
      case "clear":
        setTerminalHistory(["Terminal cleared.", ""]);
        return;
      case "run":
        runCode();
        response = ["Running code...", output || "Check Output tab for results."];
        break;
      case "echo":
        response = [args.slice(1).join(" ") || ""];
        break;
      case "date":
        response = [new Date().toString()];
        break;
      case "whoami":
        response = [userData?.firstName + " " + userData?.lastName || "guest"];
        break;
      case "ls":
        response = ["main.js", "index.html", "styles.css", "README.md"];
        break;
      case "pwd":
        response = ["/home/wayvian/projects/my-app"];
        break;
      case "cat":
        if (args[1] === "main.js") {
          response = code.split("\n");
        } else if (args[1] === "index.html") {
          response = ["<!DOCTYPE html>", "<html>", "<head><title>App</title></head>", "<body><h1>Hello</h1></body>", "</html>"];
        } else if (args[1] === "README.md") {
          response = ["# Wayvian App", "", "A coding project built with Wayvian.", "", "## Getting Started", "Run `npm install` then `npm run dev`"];
        } else {
          response = [`cat: ${args[1] || "?"}: No such file or directory`];
        }
        break;
      case "node":
        if (args[1] === "--version" || args[1] === "-v") {
          response = ["v18.17.0"];
        } else if (args.length > 1) {
          // Execute via API - handle async
          executeNodeCommand(args.slice(1).join(" "));
          return; // Exit early, async will handle response
        } else {
          response = ["Welcome to Node.js v18.17.0.", "Type \".help\" for more information.", "> (Use 'node <code>' to execute JavaScript)"];
        }
        break;
      case "python":
      case "python3":
        if (args[1] === "--version" || args[1] === "-V") {
          response = ["Python 3.11.4 (Pyodide)"];
        } else if (args.length > 1) {
          // Execute Python via Pyodide
          executePythonCommand(args.slice(1).join(" "));
          return; // Exit early, async will handle response
        } else {
          response = ["Python 3.11.4 (Pyodide)", ">>> (Use 'python <code>' to execute Python)"];
        }
        break;
      case "version":
        response = ["Wayvian Terminal v1.0.0", "Node.js v18.17.0 (simulated)", "npm v9.6.7 (simulated)"];
        break;
      case "npm":
        if (args[1] === "install" || args[1] === "i") {
          const packageName = args[2] || "";
          if (packageName) {
            response = [
              "",
              `added ${packageName}@latest`,
              "",
              "added 1 package, and audited 2 packages in 1s",
              "",
              "found 0 vulnerabilities",
            ];
          } else {
            response = [
              "",
              "added 127 packages, and audited 128 packages in 3s",
              "",
              "15 packages are looking for funding",
              "  run `npm fund` for details",
              "",
              "found 0 vulnerabilities",
            ];
          }
        } else if (args[1] === "run") {
          const script = args[2] || "start";
          if (script === "dev") {
            response = [
              "",
              "> wayvian-app@1.0.0 dev",
              "> next dev",
              "",
              "  ▲ Next.js 14.0.4",
              "  - Local:        http://localhost:3000",
              "",
              "  ✓ Ready in 1.2s",
            ];
          } else if (script === "build") {
            response = [
              "",
              "> wayvian-app@1.0.0 build",
              "> next build",
              "",
              "  ▲ Next.js 14.0.4",
              "",
              "   Creating an optimized production build...",
              "   ✓ Compiled successfully",
              "   ✓ Linting and checking validity of types",
              "   ✓ Collecting page data",
              "   ✓ Generating static pages",
              "",
              "Route (app)                              Size     First Load JS",
              "┌ ○ /                                    5.2 kB        89.5 kB",
              "├ ○ /dashboard                           12.3 kB       96.6 kB",
              "└ ○ /code                                18.7 kB       103 kB",
              "",
              "✓ Build completed successfully",
            ];
          } else {
            response = [
              "",
              `> wayvian-app@1.0.0 ${script}`,
              `> node scripts/${script}.js`,
              "",
              `Running ${script}...`,
              "✓ Done",
            ];
          }
        } else if (args[1] === "start") {
          response = [
            "",
            "> wayvian-app@1.0.0 start",
            "> next start",
            "",
            "  ▲ Next.js 14.0.4",
            "  - Local:        http://localhost:3000",
            "",
            "  ✓ Ready in 423ms",
          ];
        } else if (args[1] === "test") {
          response = [
            "",
            "> wayvian-app@1.0.0 test",
            "> jest",
            "",
            " PASS  tests/app.test.js",
            "  ✓ renders homepage (23 ms)",
            "  ✓ navigates to dashboard (45 ms)",
            "",
            "Test Suites: 1 passed, 1 total",
            "Tests:       2 passed, 2 total",
            "Time:        1.234 s",
          ];
        } else if (args[1] === "init") {
          response = [
            "This utility will walk you through creating a package.json file.",
            "",
            "package name: (my-app)",
            "version: (1.0.0)",
            "description: A Wayvian project",
            "",
            "✓ Created package.json",
          ];
        } else {
          response = [
            "npm <command>",
            "",
            "Usage:",
            "  npm install [package]   Install packages",
            "  npm run <script>        Run a script from package.json",
            "  npm start               Start the application",
            "  npm test                Run tests",
            "  npm init                Create package.json",
            "",
            "Run 'npm help' for more info",
          ];
        }
        break;
      case "git":
        if (args[1] === "status") {
          response = ["On branch main", "Your branch is up to date.", "", "nothing to commit, working tree clean"];
        } else if (args[1] === "log") {
          response = ["commit abc123 (HEAD -> main)", "Author: " + (userData?.firstName || "User"), "Date: " + new Date().toDateString(), "", "    Initial commit"];
        } else {
          response = ["git <command>", "", "Commands: status, log, add, commit, push, pull"];
        }
        break;
      default:
        if (command) {
          response = [`Command not found: ${mainCmd}`, "Type 'help' for available commands."];
        }
    }
    
    setTerminalHistory(prev => [...prev, `$ ${cmd}`, ...response, ""]);
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeTerminalCommand(terminalInput);
      setTerminalInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setTerminalInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setTerminalInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      } else {
        setHistoryIndex(-1);
        setTerminalInput("");
      }
    }
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  if (!userData) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader}></div>
        <p>Loading code editor...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* VS Code style scrollbar */
        .code-scroll-container::-webkit-scrollbar {
          width: 14px;
          height: 0;
        }
        .code-scroll-container::-webkit-scrollbar-track {
          background: #1a1a2e;
        }
        .code-scroll-container::-webkit-scrollbar-thumb {
          background: #424257;
          border: 3px solid #1a1a2e;
          border-radius: 7px;
        }
        .code-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #5a5a7a;
        }
        /* Hide horizontal scrollbar */
        .code-scroll-container::-webkit-scrollbar:horizontal {
          display: none;
        }
        /* Syntax highlighting colors - VS Code Dark+ theme */
        .comment { color: #6A9955 !important; } /* Green */
        .string { color: #CE9178 !important; } /* Orange/tan */
        .keyword { color: #C586C0 !important; } /* Purple/pink */
        .number { color: #B5CEA8 !important; } /* Light green */
        .function { color: #DCDCAA !important; } /* Yellow */
        .tag { color: #569CD6 !important; } /* Blue */
        .attribute { color: #9CDCFE !important; } /* Light blue */
        .selector { color: #D7BA7D !important; } /* Gold */
        .property { color: #9CDCFE !important; } /* Light blue */
        .value { color: #CE9178 !important; } /* Orange */
        /* AI highlighted lines in editor */
        .ai-highlighted-line {
          display: inline-block;
          width: 100%;
          background: rgba(251, 191, 36, 0.2) !important;
          border-left: 3px solid #fbbf24;
          padding-left: 5px;
          margin-left: -8px;
          box-shadow: inset 0 0 10px rgba(251, 191, 36, 0.1);
        }
        .code-textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        .run-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        .run-btn:active {
          transform: translateY(0);
        }
        .chat-toggle:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }
        .chat-input:focus {
          outline: none;
          border-color: #667eea;
        }
        .send-btn:hover:not(:disabled) {
          background: #5a67d8;
        }
        .language-dropdown-btn:hover {
          background: #2d2d44;
        }
        .language-option:hover {
          background: #2d2d44 !important;
        }
        .language-option.active {
          background: rgba(102, 126, 234, 0.2) !important;
        }
        .language-dropdown-menu {
          animation: dropdownFadeIn 0.2s ease;
        }
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tab-btn:hover {
          background: #2d2d44;
        }
        .tab-btn.active {
          background: #1a1a2e;
          border-bottom: 2px solid #667eea;
          color: #ffffff;
        }
        .terminal-input:focus {
          outline: none;
        }
        .message-bubble {
          animation: fadeIn 0.3s ease;
        }
        .apply-code-btn {
          transition: all 0.2s ease;
        }
        .apply-code-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0 !important;
            padding-top: 80px !important;
          }
          .editor-container {
            flex-direction: column !important;
          }
          .chat-panel {
            position: fixed !important;
            top: 60px !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            max-width: 400px !important;
            z-index: 1000 !important;
          }
        }
        @media (max-width: 768px) {
          .chat-panel {
            max-width: 100% !important;
          }
          .language-selector {
            flex-wrap: wrap !important;
          }
        }
        @keyframes notificationSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes progressShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .notification-popup {
          animation: notificationSlideIn 0.3s ease forwards;
        }
        .notification-popup:hover {
          transform: scale(1.02);
        }
        .notification-dismiss:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Notification Pop-ups */}
      <div style={styles.notificationContainer}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="notification-popup"
            onClick={() => {
              // Navigate to appropriate tab based on notification type
              if (notification.type === "success" || notification.type === "info") {
                setActiveTab("output");
              } else if (notification.type === "error" || notification.type === "warning") {
                setActiveTab("terminal");
              }
              dismissNotification(notification.id);
            }}
            style={{
              ...styles.notificationPopup,
              ...(notification.type === "success" ? styles.notificationSuccess : {}),
              ...(notification.type === "error" ? styles.notificationError : {}),
              ...(notification.type === "info" ? styles.notificationInfo : {}),
              ...(notification.type === "warning" ? styles.notificationWarning : {}),
            }}
          >
            <div style={styles.notificationContent}>
              <div style={styles.notificationText}>
                <strong style={styles.notificationTitle}>{notification.title}</strong>
                <p style={styles.notificationMessage}>{notification.message}</p>
              </div>
              <button
                className="notification-dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(notification.id);
                }}
                style={styles.notificationDismiss}
              >
                ✕
              </button>
            </div>
            <div 
              style={{
                ...styles.notificationProgress,
                animation: `progressShrink ${notification.duration || 3000}ms linear forwards`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        userInitial={userData.firstName[0]}
      />

      {/* Main Content */}
      <main className="main-content" style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.pageTitle}>💻 Code Editor</h1>
            <p style={styles.pageSubtitle}>Write, run, and test your code</p>
          </div>
          <div style={styles.headerRight}>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              style={{
                ...styles.chatToggle,
                background: isChatOpen 
                  ? "linear-gradient(135deg, #764ba2 0%, #667eea 100%)" 
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
              className="chat-toggle"
            >
              {isChatOpen ? "✕ Close Chat" : "🤖 AI Assistant"}
            </button>
          </div>
        </header>

        {/* Editor Container */}
        <div className="editor-container" style={styles.editorContainer}>
          {/* Code Editor Panel */}
          <div style={{
            ...styles.editorPanel,
            width: isChatOpen ? "calc(100% - 380px)" : "100%",
            transition: "width 0.3s ease",
          }}>
            {/* Language Selector Dropdown */}
            <div 
              ref={languageDropdownRef}
              style={styles.languageDropdownContainer}
            >
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                style={styles.languageDropdownBtn}
                className="language-dropdown-btn"
              >
                <span>{languages.find(l => l.id === selectedLanguage)?.icon}</span>
                <span>{languages.find(l => l.id === selectedLanguage)?.name}</span>
                <span style={{ marginLeft: "auto" }}>{isLanguageDropdownOpen ? "▲" : "▼"}</span>
              </button>
              
              {isLanguageDropdownOpen && (
                <div style={styles.languageDropdownMenu} className="language-dropdown-menu">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`language-option ${selectedLanguage === lang.id ? "active" : ""}`}
                      style={{
                        ...styles.languageOption,
                        ...(selectedLanguage === lang.id ? styles.languageOptionActive : {}),
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{lang.icon}</span>
                      <span>{lang.name}</span>
                      {selectedLanguage === lang.id && <span style={{ marginLeft: "auto" }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={styles.tabBar}>
              <button
                onClick={() => setActiveTab("editor")}
                className={`tab-btn ${activeTab === "editor" ? "active" : ""}`}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === "editor" ? styles.tabBtnActive : {}),
                }}
              >
                📝 Editor
              </button>
              <button
                onClick={() => setActiveTab("output")}
                className={`tab-btn ${activeTab === "output" ? "active" : ""}`}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === "output" ? styles.tabBtnActive : {}),
                }}
              >
                📤 Output
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`tab-btn ${activeTab === "preview" ? "active" : ""}`}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === "preview" ? styles.tabBtnActive : {}),
                }}
              >
                👁️ Preview
              </button>
              <button
                onClick={() => setActiveTab("terminal")}
                className={`tab-btn ${activeTab === "terminal" ? "active" : ""}`}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === "terminal" ? styles.tabBtnActive : {}),
                }}
              >
                ⌨️ Terminal
              </button>
              
              {/* Clear Highlights Button - shown when lines are highlighted */}
              {highlightedLines.length > 0 && (
                <button
                  onClick={() => setHighlightedLines([])}
                  style={styles.clearHighlightsBtn}
                  className="clear-highlights-btn"
                >
                  ✕ Clear Highlights ({highlightedLines.length})
                </button>
              )}
              
              {/* Language Indicator - shown in freeform mode */}
              {selectedLanguage === "freeform" && (
                <div style={styles.languageIndicatorWrapper}>
                  <button
                    onClick={() => setIsLanguageIndicatorOpen(!isLanguageIndicatorOpen)}
                    style={styles.languageIndicatorBtn}
                    className="language-indicator-btn"
                  >
                    🏷️ {freeformLanguages.find(l => l.id === freeformLanguage)?.icon} {freeformLanguages.find(l => l.id === freeformLanguage)?.name}
                    <span style={{ marginLeft: "4px", fontSize: "0.7rem" }}>{isLanguageIndicatorOpen ? "▲" : "▼"}</span>
                  </button>
                  {isLanguageIndicatorOpen && (
                    <div style={styles.languageIndicatorDropdown}>
                      <div style={styles.languageIndicatorHeader}>Select Language for AI</div>
                      {freeformLanguages.map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => {
                            setFreeformLanguage(lang.id);
                            setIsLanguageIndicatorOpen(false);
                          }}
                          style={{
                            ...styles.languageIndicatorOption,
                            ...(freeformLanguage === lang.id ? styles.languageIndicatorOptionActive : {}),
                          }}
                        >
                          {lang.icon} {lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div style={styles.tabSpacer}></div>
              {selectedLanguage === "python" && !isPyodideReady && (
                <span style={styles.pythonStatus}>
                  {isPyodideLoading ? "🐍 Loading Python..." : "🐍 Python ready on first run"}
                </span>
              )}
              {selectedLanguage === "python" && isPyodideReady && (
                <span style={styles.pythonStatusReady}>🐍 Python Ready</span>
              )}
              <button
                onClick={runCode}
                disabled={isRunning || isPyodideLoading}
                className="run-btn"
                style={styles.runBtn}
              >
                {isRunning ? "⏳ Running..." : isPyodideLoading ? "⏳ Loading..." : "▶️ Run Code"}
              </button>
            </div>

            {/* Editor / Output Area */}
            <div style={styles.editorArea}>
              {activeTab === "editor" && (
                <div style={styles.codeEditorWrapper}>
                  <div ref={lineNumbersRef} style={styles.lineNumbers}>
                    {code.split("\n").map((_, i) => (
                      <div 
                        key={i} 
                        style={{
                          ...styles.lineNumber,
                          ...(highlightedLines.includes(i + 1) ? styles.highlightedLineNumber : {})
                        }}
                      >
                        {highlightedLines.includes(i + 1) ? '→ ' : ''}{i + 1}
                      </div>
                    ))}
                  </div>
                  <div 
                    ref={codeContainerRef} 
                    style={styles.codeInputContainer}
                    className="code-scroll-container"
                    onScroll={(e) => {
                      const target = e.target as HTMLElement;
                      if (lineNumbersRef.current) {
                        lineNumbersRef.current.scrollTop = target.scrollTop;
                      }
                    }}
                  >
                    <div style={styles.codeContentWrapper}>
                      <pre
                        style={styles.highlightedCode}
                        dangerouslySetInnerHTML={{ __html: highlightCodeWithHighlights(code, selectedLanguage, highlightedLines) + "\n" }}
                      />
                      <textarea
                        ref={textareaRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        style={styles.codeTextarea}
                        className="code-textarea"
                        spellCheck={false}
                        placeholder="Start typing your code..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "output" && (
                <div style={styles.outputPanel}>
                  <div style={styles.outputHeader}>
                    <span style={styles.outputTitle}>📤 Console Output</span>
                    <button onClick={clearOutput} style={styles.clearBtn}>
                      🗑️ Clear
                    </button>
                  </div>
                  <pre style={styles.outputContent}>
                    {output || "Run your code to see output here..."}
                  </pre>
                </div>
              )}

              {activeTab === "preview" && (
                <div style={styles.previewPanel}>
                  <div style={styles.previewHeader}>
                    <span>👁️ {selectedLanguage.toUpperCase()} Preview</span>
                  </div>
                  {selectedLanguage === "html" ? (
                    <iframe
                      srcDoc={code}
                      style={styles.previewFrame}
                      title="HTML Preview"
                      sandbox="allow-scripts allow-modals"
                    />
                  ) : selectedLanguage === "css" ? (
                    <iframe
                      srcDoc={`<!DOCTYPE html><html><head><style>${code}</style></head><body><div class="card"><h1>Preview</h1><p>This is a sample paragraph to demonstrate your CSS styles.</p><button>Sample Button</button></div></body></html>`}
                      style={styles.previewFrame}
                      title="CSS Preview"
                      sandbox="allow-scripts allow-modals"
                    />
                  ) : selectedLanguage === "javascript" || selectedLanguage === "typescript" || selectedLanguage === "freeform" ? (
                    <div style={styles.previewPanel}>
                      <div style={styles.previewTabs}>
                        <button
                          onClick={() => setActiveTab("preview")}
                          style={{
                            ...styles.previewTabBtn,
                            background: "#667eea",
                            color: "white",
                          }}
                        >
                          🖥️ Visual
                        </button>
                      </div>
                      <iframe
                        srcDoc={`<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 20px;
      min-height: 100vh;
      background: #f5f5f5;
    }
    h1, h2, h3, h4, h5, h6 { margin-bottom: 10px; color: #333; }
    p { margin-bottom: 10px; color: #666; }
    button { 
      padding: 10px 20px; 
      margin: 5px;
      border: none; 
      border-radius: 5px; 
      background: #667eea; 
      color: white; 
      cursor: pointer;
      font-size: 14px;
    }
    button:hover { background: #5a6fd6; }
    input, textarea { 
      padding: 10px; 
      margin: 5px;
      border: 1px solid #ddd; 
      border-radius: 5px;
      font-size: 14px;
    }
    div { margin: 5px 0; }
    .error { color: red; padding: 10px; background: #ffebee; border-radius: 5px; }
  </style>
</head>
<body>
  <script>
    try {
      ${selectedLanguage === "typescript" ? stripTypeScript(code) : code}
    } catch (error) {
      document.body.innerHTML = '<div class="error"><strong>Error:</strong> ' + error.message + '</div>';
    }
  </script>
</body>
</html>`}
                        style={styles.previewFrame}
                        title="JavaScript Preview"
                        sandbox="allow-scripts allow-modals"
                      />
                    </div>
                  ) : selectedLanguage === "python" ? (
                    <div style={styles.previewPanel}>
                      <div style={styles.previewTabs}>
                        <button
                          onClick={() => setActiveTab("preview")}
                          style={{
                            ...styles.previewTabBtn,
                            background: "#3776ab",
                            color: "white",
                          }}
                        >
                          🐍 Visual
                        </button>
                      </div>
                      <iframe
                        srcDoc={`<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Consolas', 'Monaco', monospace; 
      padding: 20px;
      min-height: 100vh;
      background: #1e1e1e;
      color: #d4d4d4;
    }
    .output-line { 
      padding: 2px 0; 
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .output-html {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      color: #333;
      padding: 20px;
      border-radius: 8px;
      margin: 10px 0;
    }
    .output-html h1, .output-html h2, .output-html h3 { margin-bottom: 10px; color: #333; }
    .output-html p { margin-bottom: 10px; }
    .output-html button { 
      padding: 10px 20px; 
      margin: 5px;
      border: none; 
      border-radius: 5px; 
      background: #3776ab; 
      color: white; 
      cursor: pointer;
    }
    .output-html button:hover { background: #2d5f8a; }
    .placeholder {
      color: #888;
      font-style: italic;
    }
    table { border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #555; padding: 8px 12px; text-align: left; }
    th { background: #333; }
    .chart { background: #2d2d2d; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .bar { background: #3776ab; height: 20px; margin: 5px 0; border-radius: 3px; }
  </style>
</head>
<body>
  ${output ? `
    <script>
      const output = ${JSON.stringify(output)};
      // Check if output looks like HTML
      if (output.trim().startsWith('<') && output.trim().endsWith('>')) {
        document.body.innerHTML = '<div class="output-html">' + output + '</div>';
      } else {
        // Render as formatted text output
        const lines = output.split('\\n');
        document.body.innerHTML = lines.map(line => '<div class="output-line">' + line.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>').join('');
      }
    </script>
  ` : '<div class="placeholder">Click \'Run Code\' to see Python output...</div>'}
</body>
</html>`}
                        style={styles.previewFrame}
                        title="Python Preview"
                        sandbox="allow-scripts allow-modals"
                      />
                    </div>
                  ) : null}
                </div>
              )}

              {activeTab === "terminal" && (
                <div style={styles.terminalPanel}>
                  <div style={styles.terminalHeader}>
                    <div style={styles.terminalHeaderLeft}>
                      <span style={styles.terminalDot} />
                      <span style={styles.terminalDotYellow} />
                      <span style={styles.terminalDotGreen} />
                      <span style={styles.terminalTitle}>Terminal</span>
                    </div>
                    <button 
                      onClick={() => setTerminalHistory(["Terminal cleared.", ""])} 
                      style={styles.terminalClearBtn}
                    >
                      🗑️ Clear
                    </button>
                  </div>
                  <div 
                    style={styles.terminalBody}
                    onClick={() => terminalInputRef.current?.focus()}
                  >
                    {terminalHistory.map((line, index) => (
                      <div key={index} style={styles.terminalLine}>
                        {line}
                      </div>
                    ))}
                    <div style={styles.terminalInputLine}>
                      <span style={styles.terminalPrompt}>$</span>
                      <input
                        ref={terminalInputRef}
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyDown={handleTerminalKeyDown}
                        style={styles.terminalInput}
                        className="terminal-input"
                        autoFocus
                        spellCheck={false}
                      />
                    </div>
                    <div ref={terminalEndRef} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Chat Panel */}
          {isChatOpen && (
            <div className="chat-panel" style={styles.chatPanel}>
              <div style={styles.chatHeader}>
                <div style={styles.chatHeaderLeft}>
                  <span style={styles.chatIcon}>🤖</span>
                  <span style={styles.chatTitle}>AI Assistant</span>
                </div>
                <button onClick={clearChat} style={styles.chatClearBtn}>
                  🗑️
                </button>
              </div>

              <div style={styles.chatMessages}>
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="message-bubble"
                    style={{
                      ...styles.messageBubble,
                      ...(msg.role === "user" ? styles.userMessage : styles.assistantMessage),
                    }}
                  >
                    <div style={styles.messageHeader}>
                      <span style={styles.messageRole}>
                        {msg.role === "user" ? "👤 You" : "🤖 AI"}
                      </span>
                      <span style={styles.messageTime}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div style={styles.messageContent}>
                      {msg.content.split("\n").map((line, i) => (
                        <p key={i} style={{ margin: line ? "0.5rem 0" : "0.25rem 0" }}>
                          {line || "\u00A0"}
                        </p>
                      ))}
                    </div>
                    {msg.codeUpdate && (
                      <div style={styles.codeUpdateContainer}>
                        <div style={styles.codeUpdateHeader}>
                          <span>📝 Suggested Code:</span>
                        </div>
                        <pre style={styles.codeUpdatePreview}>
                          {msg.codeUpdate}
                        </pre>
                        <button
                          onClick={() => applyCodeUpdate(msg.codeUpdate!, msg.id)}
                          style={styles.applyCodeBtn}
                          className="apply-code-btn"
                        >
                          ✨ Apply to Editor
                        </button>
                      </div>
                    )}
                    {msg.codePreview && (
                      <div style={styles.codePreviewContainer}>
                        <div style={styles.codePreviewHeader}>
                          <span>👀 Code Preview:</span>
                          <span style={styles.codePreviewLegend}>
                            <span style={styles.highlightLegend}>■</span> Changed/New lines
                          </span>
                        </div>
                        <pre style={styles.codePreviewContent}>
                          {msg.codePreview.split('\n').map((line, i) => {
                            // Check for >>> marker anywhere in line (handles indented markers)
                            const markerMatch = line.match(/^(\s*)>>>\s?(.*)$/);
                            const isHighlighted = markerMatch !== null;
                            const displayLine = isHighlighted 
                              ? markerMatch[1] + markerMatch[2] // Keep indentation + content after >>>
                              : line;
                            return (
                              <div 
                                key={i} 
                                style={{
                                  ...styles.codePreviewLine,
                                  ...(isHighlighted ? styles.codePreviewLineHighlighted : {})
                                }}
                              >
                                <span style={{
                                  ...styles.codePreviewLineNumber,
                                  ...(isHighlighted ? styles.codePreviewLineNumberHighlighted : {})
                                }}>
                                  {isHighlighted ? '→' : ''} {i + 1}
                                </span>
                                <span style={{
                                  ...styles.codePreviewLineContent,
                                  ...(isHighlighted ? styles.codePreviewLineContentHighlighted : {})
                                }}>
                                  {displayLine || ' '}
                                </span>
                              </div>
                            );
                          })}
                        </pre>
                        <button
                          onClick={() => {
                            // Remove >>> markers before applying (handles indented markers)
                            const cleanCode = msg.codePreview!.split('\n').map(line => {
                              const markerMatch = line.match(/^(\s*)>>>\s?(.*)$/);
                              return markerMatch ? markerMatch[1] + markerMatch[2] : line;
                            }).join('\n');
                            applyCodeUpdate(cleanCode, msg.id);
                          }}
                          style={styles.applyPreviewBtn}
                          className="apply-preview-btn"
                        >
                          ✅ Yes, Apply These Changes
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isAiTyping && (
                  <div style={styles.typingIndicator}>
                    <span style={styles.typingDot}></span>
                    <span style={{ ...styles.typingDot, animationDelay: "0.2s" }}></span>
                    <span style={{ ...styles.typingDot, animationDelay: "0.4s" }}></span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div style={styles.chatInputArea}>
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about coding..."
                  style={styles.chatInput}
                  className="chat-input"
                  rows={2}
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || isAiTyping}
                  style={{
                    ...styles.sendBtn,
                    opacity: !chatInput.trim() || isAiTyping ? 0.5 : 1,
                  }}
                  className="send-btn"
                >
                  ➤
                </button>
              </div>

              <div style={styles.chatSuggestions}>
                {["How do I fix this error?", "Explain this code", "How can I improve it?"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setChatInput(suggestion)}
                    style={styles.suggestionBtn}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Chat overlay for mobile */}
      {isChatOpen && (
        <div
          style={styles.chatOverlay}
          onClick={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#0f0f23",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  loadingPage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    gap: "1rem",
  },
  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  main: {
    flex: 1,
    marginLeft: "260px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    flexShrink: 0,
  },
  headerLeft: {},
  headerRight: {},
  pageTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
  },
  pageSubtitle: {
    color: "#9ca3af",
    margin: "0.25rem 0 0 0",
    fontSize: "0.9rem",
  },
  chatToggle: {
    padding: "0.75rem 1.25rem",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.95rem",
  },
  editorContainer: {
    display: "flex",
    flex: 1,
    gap: "1rem",
    overflow: "hidden",
  },
  editorPanel: {
    display: "flex",
    flexDirection: "column",
    background: "#1a1a2e",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },
  languageSelector: {
    display: "flex",
    gap: "0.5rem",
    padding: "1rem",
    background: "#16162a",
    borderBottom: "1px solid #2d2d44",
    overflowX: "auto",
  },
  languageDropdownContainer: {
    position: "relative",
    padding: "0.75rem 1rem",
    background: "#16162a",
    borderBottom: "1px solid #2d2d44",
  } as React.CSSProperties,
  languageDropdownBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    minWidth: "180px",
    border: "1px solid #2d2d44",
    borderRadius: "10px",
    background: "#1a1a2e",
    color: "#e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.95rem",
    fontWeight: 500,
  } as React.CSSProperties,
  languageDropdownMenu: {
    position: "absolute",
    top: "100%",
    left: "1rem",
    right: "1rem",
    marginTop: "0.25rem",
    background: "#1a1a2e",
    border: "1px solid #2d2d44",
    borderRadius: "10px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
    zIndex: 100,
    overflow: "hidden",
  } as React.CSSProperties,
  languageOption: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    width: "100%",
    padding: "0.875rem 1rem",
    border: "none",
    background: "transparent",
    color: "#e5e7eb",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontSize: "0.95rem",
    textAlign: "left",
  } as React.CSSProperties,
  languageOptionActive: {
    background: "rgba(102, 126, 234, 0.2)",
    color: "#667eea",
  } as React.CSSProperties,
  languageBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#9ca3af",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
  },
  languageBtnActive: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  pythonStatus: {
    fontSize: "0.8rem",
    color: "#f59e0b",
    marginRight: "0.75rem",
  },
  pythonStatusReady: {
    fontSize: "0.8rem",
    color: "#10b981",
    marginRight: "0.75rem",
  },
  languageIndicatorWrapper: {
    position: "relative",
    marginLeft: "0.5rem",
  } as React.CSSProperties,
  languageIndicatorBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.4rem 0.75rem",
    border: "1px solid #3d3d5c",
    borderRadius: "6px",
    background: "linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%)",
    color: "#e5e7eb",
    fontSize: "0.8rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
  languageIndicatorDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: "4px",
    background: "#1a1a2e",
    border: "1px solid #3d3d5c",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
    zIndex: 100,
    minWidth: "180px",
    maxHeight: "300px",
    overflowY: "auto",
  } as React.CSSProperties,
  languageIndicatorHeader: {
    padding: "0.5rem 0.75rem",
    borderBottom: "1px solid #2d2d44",
    color: "#9ca3af",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
  } as React.CSSProperties,
  languageIndicatorOption: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "none",
    background: "transparent",
    color: "#e5e7eb",
    fontSize: "0.85rem",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.2s ease",
  } as React.CSSProperties,
  languageIndicatorOptionActive: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  } as React.CSSProperties,
  tabBar: {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    background: "#1e1e32",
    borderBottom: "1px solid #2d2d44",
    gap: "0.5rem",
  },
  tabBtn: {
    padding: "0.5rem 1rem",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "2px solid transparent",
    borderRadius: "8px 8px 0 0",
    background: "transparent",
    color: "#9ca3af",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.85rem",
  },
  tabBtnActive: {
    background: "#1a1a2e",
    color: "#ffffff",
    borderBottom: "2px solid #667eea",
  },
  clearHighlightsBtn: {
    padding: "0.35rem 0.75rem",
    border: "1px solid #fbbf24",
    borderRadius: "6px",
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.75rem",
    fontWeight: 500,
    marginLeft: "auto",
  } as React.CSSProperties,
  tabSpacer: {
    flex: 1,
  },
  runBtn: {
    padding: "0.5rem 1.25rem",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
  },
  editorArea: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
  },
  codeEditorWrapper: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  lineNumbers: {
    padding: "1rem 0.5rem",
    background: "#16162a",
    color: "#4a4a6a",
    textAlign: "right",
    userSelect: "none",
    fontSize: "0.9rem",
    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
    lineHeight: "1.6",
    minWidth: "3rem",
    overflowY: "hidden",
    overflowX: "hidden",
  },
  lineNumber: {
    paddingRight: "0.5rem",
  },
  highlightedLineNumber: {
    background: "rgba(251, 191, 36, 0.3)",
    color: "#fbbf24",
    fontWeight: "bold",
    borderRadius: "3px",
    paddingLeft: "0.25rem",
  } as React.CSSProperties,
  codeInputContainer: {
    position: "relative",
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    background: "#1a1a2e",
  } as React.CSSProperties,
  codeContentWrapper: {
    position: "relative",
    minHeight: "100%",
  } as React.CSSProperties,
  highlightedCode: {
    padding: "1rem",
    margin: 0,
    border: "none",
    background: "transparent",
    color: "#e5e7eb",
    fontSize: "0.95rem",
    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
    lineHeight: "1.6",
    whiteSpace: "pre",
    overflow: "visible",
    pointerEvents: "none",
  } as React.CSSProperties,
  codeTextarea: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    padding: "1rem",
    border: "none",
    background: "transparent",
    color: "transparent",
    caretColor: "#e5e7eb",
    fontSize: "0.95rem",
    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
    lineHeight: "1.6",
    resize: "none",
    outline: "none",
    overflow: "hidden",
    whiteSpace: "pre",
  } as React.CSSProperties,
  outputPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  outputHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
    background: "#16162a",
    borderBottom: "1px solid #2d2d44",
  },
  outputTitle: {
    color: "#e5e7eb",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  clearBtn: {
    padding: "0.25rem 0.75rem",
    border: "none",
    borderRadius: "6px",
    background: "#2d2d44",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  outputContent: {
    flex: 1,
    padding: "1rem",
    margin: 0,
    background: "#0f0f23",
    color: "#10b981",
    fontSize: "0.9rem",
    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
    overflow: "auto",
    whiteSpace: "pre-wrap",
  },
  previewPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  previewHeader: {
    padding: "0.75rem 1rem",
    background: "#16162a",
    color: "#e5e7eb",
    borderBottom: "1px solid #2d2d44",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  previewFrame: {
    flex: 1,
    border: "none",
    background: "white",
  },
  jsPreviewContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#0f0f23",
  },
  jsPreviewHeader: {
    padding: "0.75rem 1rem",
    background: "#16162a",
    color: "#e5e7eb",
    borderBottom: "1px solid #2d2d44",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  jsPreviewContent: {
    flex: 1,
    padding: "1rem",
    margin: 0,
    color: "#10b981",
    fontSize: "0.9rem",
    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
    overflow: "auto",
    whiteSpace: "pre-wrap",
  },
  terminalPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#0a0a14",
  },
  terminalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 1rem",
    background: "#1a1a2e",
    borderBottom: "1px solid #2d2d44",
  },
  terminalHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  terminalDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#ff5f56",
  },
  terminalDotYellow: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#ffbd2e",
  },
  terminalDotGreen: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#27ca40",
  },
  terminalTitle: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    marginLeft: "0.5rem",
  },
  terminalClearBtn: {
    padding: "0.25rem 0.75rem",
    border: "none",
    borderRadius: "6px",
    background: "#2d2d44",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  terminalBody: {
    flex: 1,
    padding: "1rem",
    overflow: "auto",
    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
    fontSize: "0.9rem",
    lineHeight: 1.6,
    cursor: "text",
  },
  terminalLine: {
    color: "#e5e7eb",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
  terminalInputLine: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  terminalPrompt: {
    color: "#10b981",
    fontWeight: 700,
  },
  terminalInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e5e7eb",
    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
    fontSize: "0.9rem",
    caretColor: "#10b981",
  },
  chatPanel: {
    width: "360px",
    background: "#1a1a2e",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    animation: "slideIn 0.3s ease",
    flexShrink: 0,
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "16px 16px 0 0",
  },
  chatHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  chatIcon: {
    fontSize: "1.25rem",
  },
  chatTitle: {
    color: "white",
    fontWeight: 700,
    fontSize: "1rem",
  },
  chatClearBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  chatMessages: {
    flex: 1,
    padding: "1rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  messageBubble: {
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    maxWidth: "90%",
  },
  userMessage: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    alignSelf: "flex-end",
    borderBottomRightRadius: "4px",
  },
  assistantMessage: {
    background: "#2d2d44",
    color: "#e5e7eb",
    alignSelf: "flex-start",
    borderBottomLeftRadius: "4px",
  },
  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
    fontSize: "0.75rem",
    opacity: 0.8,
  },
  messageRole: {
    fontWeight: 600,
  },
  messageTime: {},
  messageContent: {
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
  typingIndicator: {
    display: "flex",
    gap: "0.25rem",
    padding: "0.75rem 1rem",
    background: "#2d2d44",
    borderRadius: "12px",
    alignSelf: "flex-start",
    borderBottomLeftRadius: "4px",
  },
  typingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#667eea",
    animation: "pulse 1s infinite",
  },
  chatInputArea: {
    display: "flex",
    gap: "0.5rem",
    padding: "1rem",
    borderTop: "1px solid #2d2d44",
  },
  chatInput: {
    flex: 1,
    padding: "0.75rem",
    border: "1px solid #2d2d44",
    borderRadius: "10px",
    background: "#0f0f23",
    color: "#e5e7eb",
    fontSize: "0.9rem",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    padding: "0.75rem 1rem",
    border: "none",
    borderRadius: "10px",
    background: "#667eea",
    color: "white",
    cursor: "pointer",
    fontSize: "1.1rem",
    transition: "background 0.2s ease",
  },
  chatSuggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    padding: "0 1rem 1rem",
  },
  suggestionBtn: {
    padding: "0.375rem 0.75rem",
    border: "1px solid #2d2d44",
    borderRadius: "20px",
    background: "transparent",
    color: "#9ca3af",
    fontSize: "0.75rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  codeUpdateContainer: {
    marginTop: "0.75rem",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #2d2d44",
  } as React.CSSProperties,
  codeUpdateHeader: {
    padding: "0.5rem 0.75rem",
    background: "#1a1a2e",
    borderBottom: "1px solid #2d2d44",
    color: "#9ca3af",
    fontSize: "0.8rem",
    fontWeight: 500,
  } as React.CSSProperties,
  codeUpdatePreview: {
    margin: 0,
    padding: "0.75rem",
    background: "#0d0d1a",
    color: "#e5e7eb",
    fontSize: "0.8rem",
    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
    lineHeight: "1.5",
    maxHeight: "200px",
    overflowY: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  } as React.CSSProperties,
  applyCodeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: "100%",
    padding: "0.75rem 1rem",
    border: "none",
    borderRadius: "0 0 8px 8px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,
  codePreviewContainer: {
    marginTop: "0.75rem",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #3b82f6",
    background: "#0d1117",
  } as React.CSSProperties,
  codePreviewHeader: {
    padding: "0.5rem 0.75rem",
    background: "#1e3a5f",
    borderBottom: "1px solid #3b82f6",
    color: "#93c5fd",
    fontSize: "0.8rem",
    fontWeight: 500,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  codePreviewLegend: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "0.7rem",
    color: "#fbbf24",
  } as React.CSSProperties,
  highlightLegend: {
    color: "#fbbf24",
    fontSize: "0.6rem",
  } as React.CSSProperties,
  codePreviewContent: {
    margin: 0,
    padding: 0,
    background: "#0d1117",
    maxHeight: "300px",
    overflowY: "auto",
  } as React.CSSProperties,
  codePreviewLine: {
    display: "flex",
    fontSize: "0.8rem",
    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
    lineHeight: "1.6",
  } as React.CSSProperties,
  codePreviewLineHighlighted: {
    background: "rgba(251, 191, 36, 0.15)",
    borderLeft: "3px solid #fbbf24",
  } as React.CSSProperties,
  codePreviewLineNumber: {
    minWidth: "50px",
    padding: "0 10px",
    background: "#161b22",
    color: "#6e7681",
    textAlign: "right",
    userSelect: "none",
    borderRight: "1px solid #30363d",
  } as React.CSSProperties,
  codePreviewLineNumberHighlighted: {
    background: "rgba(251, 191, 36, 0.2)",
    color: "#fbbf24",
    fontWeight: "bold",
  } as React.CSSProperties,
  codePreviewLineContent: {
    flex: 1,
    padding: "0 10px",
    color: "#e6edf3",
    whiteSpace: "pre",
  } as React.CSSProperties,
  codePreviewLineContentHighlighted: {
    color: "#fef3c7",
  } as React.CSSProperties,
  applyPreviewBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: "100%",
    padding: "0.75rem 1rem",
    border: "none",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
  chatOverlay: {
    display: "none",
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
  // Notification styles
  notificationContainer: {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "350px",
    pointerEvents: "none",
  } as React.CSSProperties,
  notificationPopup: {
    background: "#1e1e32",
    borderRadius: "12px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
    overflow: "hidden",
    pointerEvents: "auto",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    border: "1px solid #2d2d44",
  } as React.CSSProperties,
  notificationSuccess: {
    borderLeft: "4px solid #10b981",
    background: "linear-gradient(135deg, #1e1e32 0%, #1a2f1a 100%)",
  } as React.CSSProperties,
  notificationError: {
    borderLeft: "4px solid #ef4444",
    background: "linear-gradient(135deg, #1e1e32 0%, #2f1a1a 100%)",
  } as React.CSSProperties,
  notificationInfo: {
    borderLeft: "4px solid #667eea",
    background: "linear-gradient(135deg, #1e1e32 0%, #1a1a2f 100%)",
  } as React.CSSProperties,
  notificationWarning: {
    borderLeft: "4px solid #f59e0b",
    background: "linear-gradient(135deg, #1e1e32 0%, #2f2a1a 100%)",
  } as React.CSSProperties,
  notificationContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "14px 16px",
  } as React.CSSProperties,
  notificationText: {
    flex: 1,
  } as React.CSSProperties,
  notificationTitle: {
    display: "block",
    color: "#e5e7eb",
    fontSize: "0.95rem",
    marginBottom: "2px",
  } as React.CSSProperties,
  notificationMessage: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    margin: 0,
    lineHeight: 1.4,
  } as React.CSSProperties,
  notificationDismiss: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
  notificationProgress: {
    height: "3px",
    background: "linear-gradient(90deg, #10b981 0%, #667eea 100%)",
  } as React.CSSProperties,
};
