import { loader } from '@monaco-editor/react';

// Fallback ext→language map used before Monaco finishes loading
const fallbackExtToLanguage: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  go: 'go',
  rs: 'rust',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  sh: 'shell',
  yaml: 'yaml',
  yml: 'yaml',
  sql: 'sql',
};

// Populated after Monaco loads; used by detectLanguageFromFilename
let monacoExtMap: Record<string, string> | null = null;
/**
 * Loads Monaco and returns the full list of supported language IDs.
 * Also populates the internal ext→language cache for detectLanguageFromFilename.
 */
export async function getMonacoLanguages(): Promise<string[]> {
  const monaco = await loader.init();

  type LangInfo = { id: string; extensions?: string[] };
  const langs: LangInfo[] = monaco.languages.getLanguages();

  // Build ext→language map from Monaco metadata
  monacoExtMap = {};
  for (const lang of langs) {
    for (const ext of lang.extensions ?? []) {
      const clean = ext.startsWith('.')
        ? ext.slice(1).toLowerCase()
        : ext.toLowerCase();
      monacoExtMap[clean] = lang.id;
    }
  }

  const ids = langs.map((l) => l.id).sort();
  return ['plaintext', ...ids.filter((id) => id !== 'plaintext')];
}

export function detectLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  console.log(ext);
  return (monacoExtMap ?? fallbackExtToLanguage)[ext] ?? 'plaintext';
}
