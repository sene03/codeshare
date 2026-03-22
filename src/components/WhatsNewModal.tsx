import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button';
import { type WhatsNewEntry, markWhatsNewAsSeen } from '@/lib/whatsNew';

interface WhatsNewModalProps {
  entry: WhatsNewEntry | null;
  open: boolean;
  onClose: () => void;
}

export default function WhatsNewModal({
  entry,
  open,
  onClose,
}: WhatsNewModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain && entry) {
      markWhatsNewAsSeen(entry.id);
    }
    onClose();
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="flex flex-col gap-4 max-w-md">
        <DialogHeader>
          <DialogTitle>
            What's New{entry.version ? ` — ${entry.version}` : ''}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {entry.createdAt.toDate().toLocaleDateString()}
          </p>
        </DialogHeader>

        <p className="text-sm font-medium uppercase tracking-wide">
          {entry.title}
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {entry.message}
        </p>

        <DialogFooter showCloseButton={false} className="py-1 px-4">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer mr-auto select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="accent-primary"
            />
            Don't show again
          </label>
          <Button onClick={handleClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
