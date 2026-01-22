"use client";

import { useState, useEffect, useCallback } from "react";

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string | string[]) => Promise<void>;
  globals: {
    get: (name: string) => unknown;
    set: (name: string, value: unknown) => void;
  };
}

interface PyodideResult {
  success: boolean;
  output: string;
  error?: string;
}

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<PyodideInterface>;
  }
}

export function usePyodide() {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Pyodide
  const loadPyodide = useCallback(async () => {
    if (pyodide || isLoading) return;
    
    setIsLoading(true);
    setLoadError(null);

    try {
      // Load Pyodide script from CDN
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Pyodide script"));
          document.head.appendChild(script);
        });
      }

      // Initialize Pyodide
      const pyodideInstance = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
      });

      // Set up stdout/stderr capture
      await pyodideInstance.runPythonAsync(`
import sys
from io import StringIO

class CaptureOutput:
    def __init__(self):
        self.stdout = StringIO()
        self.stderr = StringIO()
        
    def get_output(self):
        return self.stdout.getvalue()
    
    def get_error(self):
        return self.stderr.getvalue()
    
    def clear(self):
        self.stdout = StringIO()
        self.stderr = StringIO()

_capture = CaptureOutput()
      `);

      setPyodide(pyodideInstance);
      setIsReady(true);
    } catch (error) {
      setLoadError((error as Error).message);
      console.error("Failed to load Pyodide:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pyodide, isLoading]);

  // Run Python code
  const runPython = useCallback(async (code: string): Promise<PyodideResult> => {
    if (!pyodide) {
      return {
        success: false,
        output: "",
        error: "Python runtime not loaded. Click 'Run Code' to initialize.",
      };
    }

    try {
      // Capture stdout
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
_stdout_capture = StringIO()
_stderr_capture = StringIO()
_old_stdout = sys.stdout
_old_stderr = sys.stderr
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
      `);

      // Run user code
      let result;
      try {
        result = await pyodide.runPythonAsync(code);
      } catch (execError) {
        // Restore stdout/stderr
        await pyodide.runPythonAsync(`
sys.stdout = _old_stdout
sys.stderr = _old_stderr
        `);
        
        return {
          success: false,
          output: "",
          error: (execError as Error).message,
        };
      }

      // Get captured output
      const stdout = await pyodide.runPythonAsync(`
_output = _stdout_capture.getvalue()
sys.stdout = _old_stdout
sys.stderr = _old_stderr
_output
      `);

      const outputStr = String(stdout || "");
      const resultStr = result !== undefined && result !== null ? String(result) : "";

      // Combine output
      let finalOutput = outputStr;
      if (resultStr && resultStr !== "None" && resultStr !== outputStr.trim()) {
        finalOutput = finalOutput ? `${finalOutput}${resultStr}` : resultStr;
      }

      return {
        success: true,
        output: finalOutput || "Code executed successfully (no output)",
      };
    } catch (error) {
      return {
        success: false,
        output: "",
        error: (error as Error).message,
      };
    }
  }, [pyodide]);

  // Load a Python package
  const loadPackage = useCallback(async (packageName: string): Promise<boolean> => {
    if (!pyodide) return false;
    
    try {
      await pyodide.loadPackage(packageName);
      return true;
    } catch (error) {
      console.error(`Failed to load package ${packageName}:`, error);
      return false;
    }
  }, [pyodide]);

  return {
    pyodide,
    isLoading,
    isReady,
    loadError,
    loadPyodide,
    runPython,
    loadPackage,
  };
}
