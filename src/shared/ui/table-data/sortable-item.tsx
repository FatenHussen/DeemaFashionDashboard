import { Iconify } from 'src/shared/components/iconify';
import { mergeClasses } from 'minimal-shared/utils';

// Type definitions for optional dependencies
type UniqueIdentifier = string | number;

// Stub for dnd-kit if not available
let useSortable: any;
let CSS: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dndSortable = require('@dnd-kit/sortable');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dndUtilities = require('@dnd-kit/utilities');

  useSortable = dndSortable.useSortable;
  CSS = dndUtilities.CSS;
} catch {
  // DnD Kit not available - provide fallbacks
  useSortable = () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
  });
  CSS = {
    Transform: {
      toString: () => '',
    },
  };
}

interface SortableItemProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={mergeClasses([
        'flex items-center gap-2 p-2 border border-border rounded-md',
        'bg-background',
      ])}
    >
      <span {...listeners} className="cursor-grab text-muted-foreground">
        <Iconify icon="lucide:grip-vertical" width={16} />
      </span>
      {children}
    </div>
  );
}
