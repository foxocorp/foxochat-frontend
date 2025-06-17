import { useEffect, useRef, useState } from 'preact/hooks';
import { JSX } from 'preact';
import * as styles from './ContextMenu.module.scss';

export interface ContextMenuItem {
  icon?: JSX.Element;
  label?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ANIMATION_DURATION = 180;

const ContextMenu = ({ x, y, items, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        startClosing();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') startClosing();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const startClosing = () => {
    setClosing(true);
    setTimeout(onClose, ANIMATION_DURATION);
  };

  useEffect(() => {
    const prevent = (e: MouseEvent) => e.preventDefault();
    menuRef.current?.addEventListener('contextmenu', prevent);
    return () => menuRef.current?.removeEventListener('contextmenu', prevent);
  }, []);

  const [pos, setPos] = useState({ left: x, top: y });
  useEffect(() => {
    const menu = menuRef.current;
    if (menu) {
      const { innerWidth, innerHeight } = window;
      const rect = menu.getBoundingClientRect();
      let left = x, top = y;
      if (x + rect.width > innerWidth) left = innerWidth - rect.width - 8;
      if (y + rect.height > innerHeight) top = innerHeight - rect.height - 8;
      setPos({ left: Math.max(8, left), top: Math.max(8, top) });
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className={`${styles.contextMenu} ${closing ? styles.closing : ''}`}
      style={{ left: pos.left, top: pos.top }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className={styles.divider} />
        ) : (
          <div
            key={(item.label ?? 'divider') + i}
            className={`${styles.menuItem} ${item.danger ? styles.danger : ''}`}
            role="menuitem"
            onClick={() => {
              if (!item.disabled && item.onClick) {
                item.onClick();
                startClosing();
              }
            }}
            aria-disabled={item.disabled}
          >
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            <span>{item.label ?? ''}</span>
          </div>
        )
      )}
    </div>
  );
};

export default ContextMenu; 