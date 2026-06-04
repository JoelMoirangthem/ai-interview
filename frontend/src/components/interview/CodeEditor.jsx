import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiSend, FiCheckCircle, FiAlertCircle, FiCode } from 'react-icons/fi';
import Button from '../ui/Button';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' }
];

const SNIPPETS = {
  javascript: '// Write your JavaScript solution here\n\nfunction solve() {\n  // Your code\n}\n\nconsole.log(solve());',
  python: '# Write your Python solution here\n\ndef solve():\n    # Your code\n    pass\n\nprint(solve())',
  java: '// Write your Java solution here\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code\n    }\n}',
  cpp: '// Write your C++ solution here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code\n    return 0;\n}',
  go: '// Write your Go solution here\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Your code\n}',
  rust: '// Write your Rust solution here\n\nfn main() {\n    // Your code\n}',
  typescript: '// Write your TypeScript solution here\n\nfunction solve(): void {\n  // Your code\n}\n\nsolve();'
};

export default function CodeEditor({ onRun, onSubmit, loading, output }) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(SNIPPETS.javascript);
  const editorRef = useRef(null);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(SNIPPETS[lang] || SNIPPETS.javascript);
  };

  const handleRun = () => onRun(code, language);
  const handleSubmit = () => onSubmit(code, language);

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
            <FiCode className="w-3.5 h-3.5 text-cyan-300" />
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-xs font-medium pl-3 pr-8 py-1.5 rounded-lg border border-white/[0.06] outline-none focus:border-indigo-400/40 transition-colors appearance-none bg-no-repeat bg-right"
            style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23ffffff80'><path d='M6 8l4 4 4-4'/></svg>")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '0.875rem' }}
          >
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#0c0d12]">{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRun}
            loading={loading === 'run'}
            icon={FiPlay}
          >
            Run
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            loading={loading === 'submit'}
            icon={FiSend}
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(val) => setCode(val || '')}
          onMount={(editor) => { editorRef.current = editor; }}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            suggestOnTriggerCharacters: true,
            tabSize: 2,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            renderLineHighlight: 'all',
            scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 }
          }}
        />
      </div>

      {/* Output */}
      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.06] overflow-hidden"
          >
            <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.04] flex items-center gap-2">
              {output.toLowerCase().includes('error') || output.toLowerCase().includes('failed')
                ? <FiAlertCircle className="w-3.5 h-3.5 text-rose-400" />
                : <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Output</span>
            </div>
            <pre className="p-4 text-xs font-mono text-white/70 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {output}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
