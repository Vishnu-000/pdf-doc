import React, { useRef, useEffect } from 'react';
import { CATEGORY_LIST } from '../../registry/categories';
import { getToolsByCategory } from '../../registry';
import { Icon } from '../common/Icon';
import { ToolMetadata } from '../../registry/types';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  toggleButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  toggleButtonRef,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // Do nothing if click is inside the mega menu
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      // Do nothing if click is on the toggle button (the button's own onClick handles toggling)
      if (toggleButtonRef?.current && toggleButtonRef.current.contains(target)) {
        return;
      }
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, toggleButtonRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xl z-50 animate-fade-in"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CATEGORY_LIST.map((category) => {
            const tools = getToolsByCategory(category.name);
            return (
              <div key={category.name} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className={`p-1 rounded-md bg-slate-50 ${category.colorClass}`}>
                    <Icon name={category.iconName} size={16} />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {category.name}
                  </h3>
                </div>

                <ul className="space-y-1">
                  {tools.map((tool: ToolMetadata) => (
                    <li key={tool.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTool(tool.id);
                          onClose();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50/70 transition-all flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Icon
                            name={tool.iconName}
                            size={14}
                            className="text-slate-400 group-hover:text-brand-500 transition-colors flex-shrink-0"
                          />
                          <span className="truncate">{tool.name}</span>
                        </span>
                        {tool.mode === 'client' && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold flex-shrink-0">
                            Browser
                          </span>
                        )}
                        {tool.badge === 'Popular' && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-semibold flex-shrink-0">
                            Popular
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
