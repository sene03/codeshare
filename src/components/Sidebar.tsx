import { formatDistanceToNow } from 'date-fns';
import { AlignLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Snapshot } from '@/lib/snapshots';

interface SidebarProps {
  snapshots: Snapshot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function RelativeTime({ snapshot }: { snapshot: Snapshot }) {
  const date = snapshot.createdAt.toDate();
  const relative = formatDistanceToNow(date, { addSuffix: true });
  const absolute = date.toLocaleString();
  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="text-xs text-muted-foreground cursor-default">
          {relative}
        </span>
      </TooltipTrigger>
      <TooltipContent>{absolute}</TooltipContent>
    </Tooltip>
  );
}

export default function Sidebar({
  snapshots,
  selectedId,
  onSelect,
}: SidebarProps) {
  return (
    <aside className="w-56 border-r flex flex-col shrink-0 bg-background">
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <AlignLeft className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Snapshots</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-1">
          {snapshots.length === 0 && (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">
              No snapshots yet.
            </p>
          )}
          {snapshots.map((snap, idx) => (
            <div key={snap.id}>
              <button
                className={`w-full text-left px-3 py-2 transition-colors hover:bg-accent ${
                  selectedId === snap.id
                    ? 'bg-accent border-l-2 border-primary'
                    : ''
                }`}
                onClick={() => onSelect(snap.id)}
              >
                <div className="flex items-center gap-1">
                  {selectedId === snap.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">
                    {snap.fileName ?? 'untitled'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {snap.name}
                </p>
                <RelativeTime snapshot={snap} />
              </button>
              {idx < snapshots.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
