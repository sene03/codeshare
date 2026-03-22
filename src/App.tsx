import { useState, useEffect, useCallback, useRef } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  subscribeToSnapshots,
  saveSnapshot,
  type Snapshot,
} from '@/lib/snapshots';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import EditorArea from '@/components/EditorArea';
import Footer from '@/components/Footer';
import NewSnapshotModal from '@/components/NewSnapshotModal';
import WhatsNewModal from '@/components/WhatsNewModal';
import {
  fetchLatestWhatsNew,
  getSeenWhatsNewId,
  type WhatsNewEntry,
} from '@/lib/whatsNew';

export type SidebarMode = 'default' | 'latest';

export default function App() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [whatsNewEntry, setWhatsNewEntry] = useState<WhatsNewEntry | null>(
    null,
  );
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);

  const prevSnapshotIdsRef = useRef<Set<string>>(new Set());

  // Fetch and show What's New on mount
  useEffect(() => {
    fetchLatestWhatsNew().then((entry) => {
      if (!entry) return;
      if (getSeenWhatsNewId() === entry.id) return;
      setWhatsNewEntry(entry);
      setIsWhatsNewOpen(true);
    });
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Subscribe to Firestore snapshots
  useEffect(() => {
    const unsub = subscribeToSnapshots((snaps) => {
      setSnapshots(snaps);

      if (sidebarMode === 'latest' && snaps.length > 0) {
        setSelectedId(snaps[0].id);
      } else if (selectedId === null && snaps.length > 0) {
        setSelectedId(snaps[0].id);
      }

      prevSnapshotIdsRef.current = new Set(snaps.map((s) => s.id));
    });
    return unsub;
  }, [sidebarMode]);

  const selectedSnapshot = snapshots.find((s) => s.id === selectedId) ?? null;

  const openNewModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleSave = async (data: {
    code: string;
    name: string;
    language: string;
    fileName: string | null;
  }) => {
    setIsSaving(true);
    try {
      const id = await saveSnapshot(data);
      setSelectedId(id);
      setIsModalOpen(false);
      toast.success(`Snapshot saved: ${data.name}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save snapshot');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = useCallback(() => {
    const code = selectedSnapshot?.code ?? '';
    navigator.clipboard.writeText(code).then(() => {
      toast.success('Code copied to clipboard');
    });
  }, [selectedSnapshot]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      // Alt+N → new snapshot (Ctrl/Cmd+N conflicts with browser new-window)
      // Use e.code instead of e.key because Alt on macOS remaps key to dead/special chars
      if (e.altKey && e.code === 'KeyN') {
        e.preventDefault();
        if (!isModalOpen) openNewModal();
      }
      if (mod && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleCopyCode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openNewModal, handleCopyCode, isModalOpen]);

  const handleSelectSnapshot = (id: string) => {
    setSelectedId(id);
    setSidebarMode('default');
  };

  const handleSidebarModeChange = (mode: SidebarMode) => {
    setSidebarMode(mode);
    if (mode === 'latest' && snapshots.length > 0) {
      setSelectedId(snapshots[0].id);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen px-12 pt-8 bg-background text-foreground">
        <Header
          sidebarMode={sidebarMode}
          onSidebarModeChange={handleSidebarModeChange}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
          onCopyCode={handleCopyCode}
          onNewSnapshot={openNewModal}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            snapshots={snapshots}
            selectedId={selectedId}
            onSelect={handleSelectSnapshot}
          />
          <EditorArea snapshot={selectedSnapshot} isDark={isDark} />
        </div>
        <Footer />
        <NewSnapshotModal
          open={isModalOpen}
          isDark={isDark}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
        <WhatsNewModal
          entry={whatsNewEntry}
          open={isWhatsNewOpen}
          onClose={() => setIsWhatsNewOpen(false)}
        />
        <Toaster position="bottom-right" richColors />
      </div>
    </TooltipProvider>
  );
}
