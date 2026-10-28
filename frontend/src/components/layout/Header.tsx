import React, { useState, useRef, useEffect } from 'react';
import { MegaMenu } from './MegaMenu';
import { searchTools } from '../../registry';
import { Icon } from '../common/Icon';
import {
  ChevronDown,
  Search,
  Sparkles,
  ShieldCheck,
  X,
  FileCheck2,
} from 'lucide-react';
import { ToolMetadata } from '../../registry/types';

interface HeaderProps {
  currentToolId: string | null;
  onNavigateHome: () => void;
  onSelectTool: (toolId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentToolId,
  onNavigateHome,
  onSelectTool,
}) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const megaMenuButtonRef = useRef<HTMLButtonElement>(null);

  const searchResults = searchQuery.trim() ? searchTools(searchQuery) : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <FileCheck2 size={20} strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-950 via-slate-900 to-brand-700 bg-clip-text text-transparent">
                  PDF<span className="text-brand-600">-Doc</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Client-First
                </span>
              </div>
            </button>

            {/* Mega Menu Toggle */}
            <div className="relative">
              <button
                ref={megaMenuButtonRef}
                type="button"
                onClick={() => setIsMegaMenuOpen((prev) => !prev)}
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isMegaMenuOpen
                    ? 'bg-brand-50 text-brand-700 shadow-xs'
                    : 'text-slate-700 hover:text-brand-600 hover:bg-slate-50'
                }`}
              >
                <span>All PDF Tools</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 transform ${
                    isMegaMenuOpen ? 'rotate-180 text-brand-600' : 'rotate-0 text-slate-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick Tool Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelectTool('merge-pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentToolId === 'merge-pdf'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              Merge PDF
            </button>
            <button
              type="button"
              onClick={() => onSelectTool('split-pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentToolId === 'split-pdf'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              Split PDF
            </button>
            <button
              type="button"
              onClick={() => onSelectTool('organize-pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentToolId === 'organize-pdf'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              Organize
            </button>
            <button
              type="button"
              onClick={() => onSelectTool('jpg-to-pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentToolId === 'jpg-to-pdf'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              JPG to PDF
            </button>
          </nav>

          {/* Search Bar */}
          <div ref={searchContainerRef} className="relative w-44 sm:w-64">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Instant Search Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-full right-0 w-80 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-fade-in max-h-96 overflow-y-auto">
                <div className="p-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Matching Tools ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No tools found matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="p-1 space-y-0.5">
                    {searchResults.map((tool: ToolMetadata) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          onSelectTool(tool.id);
                          setSearchQuery('');
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                            <Icon name={tool.iconName} size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-brand-600">
                              {tool.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {tool.category}
                            </p>
                          </div>
                        </div>
                        {tool.mode === 'client' && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex-shrink-0">
                            In-Browser
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic MegaMenu Dropdown */}
      <MegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
        onSelectTool={onSelectTool}
        toggleButtonRef={megaMenuButtonRef}
      />
    </header>
  );
};
