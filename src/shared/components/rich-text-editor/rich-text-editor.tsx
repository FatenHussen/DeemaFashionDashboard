import './rich-text-editor.css';

import { useEffect } from 'react';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';
import { mergeClasses } from 'minimal-shared/utils';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Iconify } from '@/shared/components/iconify';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor, EditorContent } from '@tiptap/react';

// ----------------------------------------------------------------------

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** Use `rtl` for Arabic fields */
  dir?: 'ltr' | 'rtl';
  disabled?: boolean;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = '',
  dir = 'ltr',
  disabled = false,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: placeholder || ' ',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value || '',
    editable: !disabled,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  // Sync external value (e.g. form reset / load product) without fighting the caret while typing
  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    const incoming = value || '';
    const current = editor.getHTML();
    if (incoming !== current) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  const btn = (isActive: boolean) =>
    mergeClasses([
      isActive ? 'is-active' : '',
      'rounded-lg border border-transparent px-2 py-1 min-w-8 h-8 inline-flex items-center justify-center',
    ]);

  return (
    <div
      className={mergeClasses([
        'rich-text-editor-root',
        dir === 'rtl' ? 'rich-text-editor--rtl' : '',
        disabled ? 'rich-text-editor-root--disabled' : '',
        className,
      ])}
      dir={dir}
    >
      {editor && (
        <div className="rich-text-editor-toolbar" role="toolbar" aria-label="Formatting">
          <button
            type="button"
            className={btn(editor.isActive('bold'))}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-pressed={editor.isActive('bold')}
            title="Bold"
          >
            <span className="font-bold">B</span>
          </button>
          <button
            type="button"
            className={btn(editor.isActive('italic'))}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-pressed={editor.isActive('italic')}
            title="Italic"
          >
            <span className="italic">I</span>
          </button>
          <button
            type="button"
            className={btn(editor.isActive('underline'))}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-pressed={editor.isActive('underline')}
            title="Underline"
          >
            <span className="underline">U</span>
          </button>
          <button
            type="button"
            className={btn(editor.isActive('heading', { level: 2 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading"
          >
            H2
          </button>
          <button
            type="button"
            className={btn(editor.isActive('bulletList'))}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            <Iconify icon="solar:list-bold" width={18} />
          </button>
          <button
            type="button"
            className={btn(editor.isActive('orderedList'))}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            <Iconify icon="solar:list-numbers-bold" width={18} />
          </button>
          <button
            type="button"
            className={btn(editor.isActive({ textAlign: 'left' }))}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align left"
          >
            <Iconify icon="solar:align-left-bold" width={18} />
          </button>
          <button
            type="button"
            className={btn(editor.isActive({ textAlign: 'center' }))}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align center"
          >
            <Iconify icon="solar:align-center-bold" width={18} />
          </button>
          <button
            type="button"
            className={btn(editor.isActive({ textAlign: 'right' }))}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align right"
          >
            <Iconify icon="solar:align-right-bold" width={18} />
          </button>
          <button
            type="button"
            className={btn(false)}
            onClick={() => {
              const url = window.prompt('Link URL');
              if (url === null) return;
              if (url === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                return;
              }
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }}
            title="Link"
          >
            <Iconify icon="solar:link-bold" width={18} />
          </button>
          <button
            type="button"
            className={btn(false)}
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Iconify icon="solar:undo-left-bold" width={18} />
          </button>
          <button
            type="button"
            className={btn(false)}
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Iconify icon="solar:undo-right-bold" width={18} />
          </button>
        </div>
      )}
      <EditorContent editor={editor} onBlur={onBlur} />
    </div>
  );
}
