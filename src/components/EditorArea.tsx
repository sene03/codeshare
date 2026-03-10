import MonacoEditor from '@monaco-editor/react'
import type { Snapshot } from '@/lib/snapshots'

interface EditorAreaProps {
  snapshot: Snapshot | null
  isDark: boolean
}

export default function EditorArea({ snapshot, isDark }: EditorAreaProps) {
  const code = snapshot?.code ?? ''
  const language = snapshot?.language ?? 'plaintext'

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {snapshot && (
        <div className="px-4 py-2 border-b flex items-center gap-3 text-sm bg-muted/40 shrink-0">
          <span className="font-medium">{snapshot.fileName ?? 'untitled'}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{snapshot.name}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{snapshot.language}</span>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language={language}
          value={code}
          theme={isDark ? 'vs-dark' : 'vs-light'}
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  )
}
