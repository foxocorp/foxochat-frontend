import { useState, useCallback } from 'preact/hooks';
import { ContextMenuItem } from './ContextMenu';

export interface UseContextMenu {
  isOpen: boolean;
  x: number;
  y: number;
  open: (x: number, y: number, items: ContextMenuItem[]) => void;
  close: () => void;
  items: ContextMenuItem[];
}

export function useContextMenu(): UseContextMenu {
  const [isOpen, setIsOpen] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [items, setItems] = useState<ContextMenuItem[]>([]);

  const open = useCallback((x: number, y: number, items: ContextMenuItem[]) => {
    setX(x);
    setY(y);
    setItems(items);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, x, y, open, close, items };
} 