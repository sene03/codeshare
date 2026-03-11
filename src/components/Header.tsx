import { Copy, Moon, Sun, Plus, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { SidebarMode } from '@/App'

interface HeaderProps {
  sidebarMode: SidebarMode
  onSidebarModeChange: (mode: SidebarMode) => void
  isDark: boolean
  onToggleTheme: () => void
  onCopyCode: () => void
  onNewSnapshot: () => void
}

export default function Header({
  sidebarMode,
  onSidebarModeChange,
  isDark,
  onToggleTheme,
  onCopyCode,
  onNewSnapshot,
}: HeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopyCode()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <header className="flex items-center justify-between px-4 pb-4 pt-2 border-b bg-background shrink-0">
      <span className="font-bold text-lg tracking-tight select-none">CodeShare</span>
      <div className="flex items-center gap-2">
        {/* Default / Latest toggle */}
        <div className="flex items-center rounded-md border overflow-hidden text-sm">
          <button
            className={`px-3 py-1 transition-colors ${
              sidebarMode === 'default'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
            onClick={() => onSidebarModeChange('default')}
          >
            Default
          </button>
          <button
            className={`px-3 py-1 transition-colors ${
              sidebarMode === 'latest'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
            onClick={() => onSidebarModeChange('latest')}
          >
            Latest
          </button>
        </div>

        {/* Dark mode toggle */}
        <Button variant="ghost" size="icon" onClick={onToggleTheme} title="Toggle theme">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Copy Code */}
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy Code
        </Button>

        {/* New snapshot */}
        <Button size="sm" onClick={onNewSnapshot} className="gap-1">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>
    </header>
  )
}
