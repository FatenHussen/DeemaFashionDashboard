import 'tinymce/tinymce';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/table';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/directionality';
import 'tinymce/skins/ui/oxide/skin.css';

import type { Editor as TinyMCEEditor } from 'tinymce';

import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

// ----------------------------------------------------------------------

const TABLE_BORDER = '1px solid #ccc';

/** Ensures pasted / inserted tables show a visible grid in the editor and in saved HTML. */
function applyVisibleBordersToTables(root: HTMLElement | null) {
  if (!root) return;
  root.querySelectorAll('table').forEach((tableEl) => {
    const table = tableEl as HTMLTableElement;
    table.style.borderCollapse = 'collapse';
    table.style.width = table.style.width || '100%';
    table.querySelectorAll('td, th').forEach((cellEl) => {
      const cell = cellEl as HTMLTableCellElement;
      cell.style.border = TABLE_BORDER;
      if (!cell.style.padding) cell.style.padding = '4px 8px';
    });
  });
}

export type TinyMCEEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  disabled?: boolean;
  height?: number;
  /** When true, shows the classic menu bar (File, Edit, View, …) plus the toolbar. Default false for compact forms. */
  menubar?: boolean;
  /**
   * When true (with `menubar`), registers **Tools → Word count** via the `wordcount` plugin.
   * Without this, the plugin may load but the menu item can be missing from Tools.
   */
  toolsMenuWordCount?: boolean;
};

export function TinyMCEEditorField({
  value,
  onChange,
  onBlur,
  placeholder = '',
  dir = 'ltr',
  disabled = false,
  height = 250,
  menubar = false,
  toolsMenuWordCount = true,
}: TinyMCEEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  return (
    <Editor
      licenseKey="gpl"
      onInit={(_evt, editor) => {
        editorRef.current = editor;
      }}
      value={value}
      onEditorChange={(content) => onChange(content)}
      onBlur={onBlur}
      disabled={disabled}
      init={{
        height,
        menubar,
        plugins: ['link', 'lists', 'table', 'wordcount', 'autolink', 'directionality'],
        toolbar:
          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link table | align lineheight | numlist bullist indent outdent | removeformat',
        placeholder,
        directionality: dir === 'rtl' ? 'rtl' : 'ltr',
        content_style: `
          body {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 12pt;
            direction: ${dir};
            text-align: ${dir === 'rtl' ? 'right' : 'left'};
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table td,
          table th {
            border: ${TABLE_BORDER};
            padding: 4px 8px;
          }
        `,
        table_default_attributes: { border: '1' },
        table_default_styles: {
          'border-collapse': 'collapse',
          width: '100%',
        },
        paste_postprocess: (_editor, args) => {
          applyVisibleBordersToTables(args.node);
        },
        ...(menubar && toolsMenuWordCount
          ? {
              menu: {
                tools: { title: 'Tools', items: 'wordcount' },
              },
            }
          : {}),
        promotion: false,
        skin: false,
        content_css: false,
      }}
    />
  );
}
