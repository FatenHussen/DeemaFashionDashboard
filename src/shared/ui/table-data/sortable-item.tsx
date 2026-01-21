import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { mergeClasses } from 'minimal-shared/utils';

import { Iconify } from 'src/shared/components/iconify';

// Type definitions for optional dependencies
type UniqueIdentifier = string | number;

interface SortableItemProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

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
