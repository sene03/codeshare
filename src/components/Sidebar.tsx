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
import { cn } from '@/lib/utils';

interface SidebarProps {
  snapshots: Snapshot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
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
  isCollapsed,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'border-r flex flex-col shrink-0 overflow-hidden bg-background transition-[width] duration-200',
        isCollapsed ? 'w-12' : 'w-56',
      )}
    >
      <div className="relative h-10 border-b">
        <button
          type="button"
          onClick={onToggle}
          className="absolute left-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <div className="flex h-full w-56 items-center pl-12 pr-3">
          <span
            className={cn(
              'whitespace-nowrap text-sm font-medium transition-opacity duration-150',
              isCollapsed ? 'opacity-0 delay-0' : 'opacity-100 delay-100',
            )}
          >
            Snapshots
          </span>
        </div>
      </div>
      <div
        className={cn(
          'flex-1 overflow-hidden transition-opacity duration-150',
          isCollapsed
            ? 'pointer-events-none opacity-0 delay-0'
            : 'opacity-100 delay-100',
        )}
        aria-hidden={isCollapsed}
      >
        <ScrollArea className="h-full w-56">
          <div className="py-1">
            {snapshots.length === 0 && (
              <p className="text-xs text-muted-foreground px-3 py-4 text-center">
                No snapshots yet.
              </p>
            )}
            {snapshots.map((snap, idx) => (
              <div key={snap.id}>
                <button
                  className={cn(
                    'w-full border-l-2 border-transparent px-3 py-2 text-left transition-colors hover:bg-accent',
                    selectedId === snap.id && 'bg-accent border-primary',
                  )}
                  onClick={() => onSelect(snap.id)}
                >
                  <div className="flex items-center">
                    <span
                      className={cn(
                        selectedId === snap.id
                          ? 'bg-primary'
                          : 'bg-transparent',
                      )}
                    />
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
      </div>
    </aside>
  );
}
