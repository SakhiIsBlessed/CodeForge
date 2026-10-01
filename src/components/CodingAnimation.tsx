import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, Pause, Terminal, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CodeSnippet {
  language: string;
  filename: string;
  code: string;
  expectedOutput: string[];
}

const SNIPPETS: CodeSnippet[] = [
  {
    language: 'TypeScript',
    filename: 'quicksort.ts',
    code: `// Fast In-Place QuickSort Algorithm
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = arr.filter((x, i) => x <= pivot && i < arr.length - 1);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}

const dataset = [38, 27, 43, 3, 9, 82, 10];
console.log("Original: " + dataset.join(", "));
console.log("Sorted:   " + quickSort(dataset).join(", "));`,
    expectedOutput: [
      '> [tsc] Compiling quicksort.ts (0 errors)',
      '> Original: 38, 27, 43, 3, 9, 82, 10',
      '> Sorted:   3, 9, 10, 27, 38, 43, 82',
      '> Execution completed in 1.42ms with exit code 0',
    ],
  },
  {
    language: 'Python',
    filename: 'fibonacci.py',
    code: `# Dynamic Programming Fibonacci
def fibonacci(n: int, memo: dict = {}) -> int:
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
    return memo[n]

sequence = [fibonacci(i) for i in range(10)]
print(f"Fibonacci series: {sequence}")
print("Memoized computations: complete.")`,
    expectedOutput: [
      '> Python 3.12.3 fibonacci.py',
      '> Fibonacci series: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]',
      '> Memoized computations: complete.',
      '> Process finished with exit code 0',
    ],
  },
  {
    language: 'C++',
    filename: 'binary_tree.cpp',
    code: `// In-order Traversal of Binary Tree
#include <iostream>
#include <vector>

void traverse(int depth) {
    if (depth > 3) return;
    std::cout << "Level " << depth << " traversed successfully" << std::endl;
    traverse(depth + 1);
}

int main() {
    std::cout << "Initializing Tree..." << std::endl;
    traverse(1);
    return 0;
}`,
    expectedOutput: [
      '> g++ -O3 -std=c++20 binary_tree.cpp -o tree.out',
      '> Initializing Tree...',
      '> Level 1 traversed successfully',
      '> Level 2 traversed successfully',
      '> Level 3 traversed successfully',
      '> Program exited with code 0',
    ],
  },
];

export const CodingAnimation: React.FC = () => {
  const { theme } = useTheme();
  const [selectedSnippetIdx, setSelectedSnippetIdx] = useState(0);
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);

  const snippet = SNIPPETS[selectedSnippetIdx];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Restart typing when snippet changes
  useEffect(() => {
    setDisplayedLength(0);
    setHasExecuted(false);
    setIsRunningSim(false);
    setIsPlaying(true);
  }, [selectedSnippetIdx]);

  // Typing effect loop
  useEffect(() => {
    if (!isPlaying) return;

    if (displayedLength < snippet.code.length) {
      const char = snippet.code[displayedLength];
      // Slightly variable typing speed for realistic cadence
      const speed = char === '\n' ? 60 : char === ' ' ? 20 : 25;

      timerRef.current = setTimeout(() => {
        setDisplayedLength((prev) => prev + 1);
      }, speed);
    } else if (!hasExecuted && !isRunningSim) {
      // Finished typing: simulate compilation and run
      setIsRunningSim(true);
      timerRef.current = setTimeout(() => {
        setIsRunningSim(false);
        setHasExecuted(true);
      }, 500);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedLength, isPlaying, snippet.code, hasExecuted, isRunningSim]);

  const handleReplay = () => {
    setDisplayedLength(0);
    setHasExecuted(false);
    setIsRunningSim(false);
    setIsPlaying(true);
  };

  const handleSkipToEnd = () => {
    setDisplayedLength(snippet.code.length);
    setIsRunningSim(false);
    setHasExecuted(true);
  };

  const currentCode = snippet.code.slice(0, displayedLength);

  return (
    <div
      className={`rounded-lg border shadow-xl overflow-hidden font-mono text-xs transition-colors ${
        theme === 'dark'
          ? 'border-[#232733] bg-[#0c0d12] text-slate-200'
          : 'border-slate-300 bg-white text-slate-800 shadow-slate-200'
      }`}
    >
      {/* Titlebar with language tabs */}
      <div
        className={`flex items-center justify-between px-3.5 py-2 border-b select-none transition-colors ${
          theme === 'dark' ? 'border-[#232733] bg-[#12151c]' : 'border-slate-200 bg-slate-100 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex items-center gap-1">
            {SNIPPETS.map((s, idx) => (
              <button
                key={s.language}
                onClick={() => setSelectedSnippetIdx(idx)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedSnippetIdx === idx
                    ? theme === 'dark'
                      ? 'bg-[#1b202c] text-[#38bdf8] border border-[#2d3444]'
                      : 'bg-white text-sky-600 border border-slate-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {s.filename}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1 rounded transition-colors ${
              theme === 'dark' ? 'hover:bg-[#1b202c] text-slate-400' : 'hover:bg-slate-200 text-slate-600'
            }`}
            title={isPlaying ? 'Pause Animation' : 'Resume'}
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
          </button>
          <button
            onClick={handleReplay}
            className={`p-1 rounded transition-colors ${
              theme === 'dark' ? 'hover:bg-[#1b202c] text-slate-400' : 'hover:bg-slate-200 text-slate-600'
            }`}
            title="Replay from start"
          >
            <RotateCw className="h-3 w-3" />
          </button>
          {displayedLength < snippet.code.length && (
            <button
              onClick={handleSkipToEnd}
              className="text-[10px] text-slate-500 hover:text-slate-400 underline"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Code Editor Window */}
      <div className="grid grid-cols-12 min-h-[220px]">
        {/* Line Numbers */}
        <div
          className={`col-span-1 border-r py-3 pr-2 text-right text-[11px] select-none ${
            theme === 'dark'
              ? 'border-[#1e2330] bg-[#090a0f] text-slate-600'
              : 'border-slate-200 bg-slate-50 text-slate-400'
          }`}
        >
          {snippet.code.split('\n').map((_, i) => (
            <div key={i} className="leading-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code View with Blinking Cursor */}
        <div className="col-span-11 p-3 leading-5 text-[12px] overflow-x-auto whitespace-pre font-mono">
          <span className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
            {currentCode}
          </span>
          {/* Animated Blinking Cursor */}
          <span
            className={`inline-block w-2 h-4 align-middle ml-0.5 animate-pulse ${
              theme === 'dark' ? 'bg-[#38bdf8]' : 'bg-sky-600'
            }`}
          />
        </div>
      </div>

      {/* Mini Output Console */}
      <div
        className={`border-t p-3 text-[11px] leading-5 ${
          theme === 'dark' ? 'border-[#1e2330] bg-[#090a0f]' : 'border-slate-200 bg-slate-900 text-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1 font-semibold">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3 w-3" />
            <span>TERMINAL</span>
          </div>
          {isRunningSim && (
            <span className="text-[#38bdf8] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
              <span>Compiling &amp; Running...</span>
            </span>
          )}
          {hasExecuted && (
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <Check className="h-3 w-3" />
              <span>Exit 0</span>
            </span>
          )}
        </div>

        {hasExecuted ? (
          <div className="space-y-0.5 text-slate-300 animate-in fade-in duration-300">
            {snippet.expectedOutput.map((out, i) => (
              <div
                key={i}
                className={
                  out.includes('0 errors') || out.includes('Sorted') || out.includes('Fibonacci')
                    ? 'text-emerald-400 font-medium'
                    : 'text-slate-400'
                }
              >
                {out}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 italic">
            {isRunningSim ? 'Executing sandboxed runtime...' : 'Waiting for code completion...'}
          </div>
        )}
      </div>
    </div>
  );
};
