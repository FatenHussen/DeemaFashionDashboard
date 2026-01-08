import type { NavSectionProps } from 'src/shared/components/nav-section';

import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useBoolean } from 'minimal-shared/hooks';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Input, Modal } from 'src/shared/ui';

import { Label } from 'src/shared/components/label';
import { Iconify } from 'src/shared/components/iconify';
import { Scrollbar } from 'src/shared/components/scrollbar';
import { SearchNotFound } from 'src/shared/components/search-not-found';

import { ResultItem } from './result-item';
import { applyFilter, flattenNavSections } from './utils';

// ----------------------------------------------------------------------

export type SearchbarProps = React.HTMLAttributes<HTMLDivElement> & {
  data?: NavSectionProps['data'];
  className?: string;
};

const breakpoint = 'sm';

export function Searchbar({ data: navItems = [], className, ...other }: SearchbarProps) {
  const [isSmUp, setIsSmUp] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      setIsSmUp(window.matchMedia(`(min-width: 640px)`).matches);
    };
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  const { value: open, onFalse: onClose, onTrue: onOpen, onToggle } = useBoolean();
  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = useCallback(() => {
    onClose();
    setSearchQuery('');
  }, [onClose]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.metaKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onToggle();
        setSearchQuery('');
      }
    },
    [onToggle]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const formattedNavItems = flattenNavSections(navItems);

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: formattedNavItems,
        query: searchQuery,
      }),
    [formattedNavItems, searchQuery]
  );

  const notFound = searchQuery && !dataFiltered.length;

  const renderButton = () => (
    <Box
      onClick={onOpen}
      className={`flex items-center ${
        isSmUp
          ? 'pr-1 rounded-xl cursor-pointer bg-muted hover:bg-muted/80 transition-colors'
          : ''
      } ${className || ''}`}
      {...other}
    >
      <Box component={isSmUp ? 'span' : 'button'} className={isSmUp ? 'p-1 inline-flex text-gray-600' : ''}>
        <Iconify icon="eva:search-fill" />
      </Box>

      <Label
        className={`text-gray-800 cursor-inherit bg-white text-xs shadow-sm ${
          isSmUp ? 'inline-flex' : 'hidden'
        }`}
      >
        ⌘K
      </Label>
    </Box>
  );

  const renderResults = () => (
    <ul className="p-0 m-0 list-none">
      {dataFiltered.map((item) => {
        const matchesTitle = match(item.title, searchQuery, { insideWords: true });
        const partsTitle = parse(item.title, matchesTitle);

        const matchesPath = match(item.path, searchQuery, { insideWords: true });
        const partsPath = parse(item.path, matchesPath);

        return (
          <li key={`${item.title}${item.path}`} className="p-0 mb-0 hover:bg-transparent">
            <ResultItem
              path={partsPath}
              title={partsTitle}
              href={item.path}
              labels={item.group.split('.')}
              onClick={handleClose}
            />
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {renderButton()}

      <Modal
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        className="mt-16"
      >
        <div className="flex flex-col">
          <div className="p-6 border-b border-border">
            <Input
              fullWidth
              autoFocus={open}
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              startAdornment={
                <Iconify icon="eva:search-fill" width={24} className="text-gray-400" />
              }
              endAdornment={<Label className="tracking-wider text-gray-500">esc</Label>}
              id="search-input"
              className="text-lg"
            />
          </div>

          {notFound ? (
            <SearchNotFound query={searchQuery} className="py-15 px-2.5" />
          ) : (
            <Scrollbar className="p-2.5 h-[400px]">{renderResults()}</Scrollbar>
          )}
        </div>
      </Modal>
    </>
  );
}
