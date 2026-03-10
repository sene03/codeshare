const extToLanguage: Record<string, string> = {
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
}

export const SUPPORTED_LANGUAGES = [
  'plaintext',
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'c',
  'csharp',
  'go',
  'rust',
  'html',
  'css',
  'json',
  'markdown',
  'shell',
  'yaml',
  'sql',
]

export function detectLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return extToLanguage[ext] ?? 'plaintext'
}
