import { useState, useEffect, useCallback, useRef } from 'react';
import MonacoEditor, { type OnMount } from '@monaco-editor/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  detectLanguageFromFilename,
  SUPPORTED_LANGUAGES,
} from '@/lib/language';

interface NewSnapshotModalProps {
  open: boolean;
  isDark: boolean;
  onClose: () => void;
  onSave: (data: {
    code: string;
    name: string;
    language: string;
    fileName: string | null;
  }) => Promise<void>;
  isSaving: boolean;
}

export default function NewSnapshotModal({
  open,
  isDark,
  onClose,
  onSave,
  isSaving,
}: NewSnapshotModalProps) {
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [description, setDescription] = useState('');

  const handleFileNameChange = (name: string) => {
    setFileName(name);
    if (name.includes('.')) {
      setLanguage(detectLanguageFromFilename(name));
    }
  };

  const handleClose = () => {
    setCode('');
    setFileName('');
    setLanguage('plaintext');
    setDescription('');
    onClose();
  };

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    await onSave({
      code,
      name: description || 'untitled',
      language,
      fileName: fileName || null,
    });
    setCode('');
    setFileName('');
    setLanguage('plaintext');
    setDescription('');
  }, [code, description, language, fileName, onSave, isSaving]);

  // Keep a ref so Monaco command and window listener always call the latest version
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  // Ctrl+S / Cmd+S for inputs outside the editor
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Ctrl+S / Cmd+S inside Monaco Editor
  // addAction is the recommended Monaco API for keybindings and reliably overrides
  // the built-in Cmd+S on the first keypress (addCommand can miss the first press).
  const handleEditorMount: OnMount = (editor, monaco) => {
    editor.addAction({
      id: 'save-snapshot',
      label: 'Save Snapshot',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        handleSaveRef.current();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="flex flex-col gap-0 p-0 overflow-hidden"
        style={{ width: '80vw', maxWidth: '80vw', height: '80vh' }}
      >
        <DialogHeader className="px-6 pt-5 pb-0 shrink-0">
          <DialogTitle>New Snapshot</DialogTitle>
        </DialogHeader>

        {/* Fields */}
        <div className="flex gap-3 flex-wrap px-6 py-4 border-b shrink-0">
          <div className="flex flex-col gap-1 min-w-40">
            <Label htmlFor="new-filename" className="text-xs">
              Filename
            </Label>
            <Input
              id="new-filename"
              placeholder="e.g. main.js"
              value={fileName}
              onChange={(e) => handleFileNameChange(e.target.value)}
              className="h-7 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-36">
            <Label htmlFor="new-language" className="text-xs">
              Language
            </Label>
            <Select
              value={language}
              onValueChange={(v) => {
                if (v) setLanguage(v);
              }}
            >
              <SelectTrigger id="new-language" className="h-7 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <Label htmlFor="new-description" className="text-xs">
              Description
            </Label>
            <Input
              id="new-description"
              placeholder="e.g. fix login bug"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-7 text-sm"
            />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            language={language}
            value={code}
            theme={isDark ? 'vs-dark' : 'vs-light'}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
            }}
            onChange={(val) => setCode(val ?? '')}
            onMount={handleEditorMount}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
