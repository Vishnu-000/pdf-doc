import React, { useState } from 'react';
import { CATEGORIES, CATEGORY_LIST } from '../registry/categories';
import { ALL_TOOLS_METADATA } from '../registry';
import { ToolCategory, ToolMetadata } from '../registry/types';
import { Icon } from '../components/common/Icon';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface HomePageProps {
  onSelectTool: (toolId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTool }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = ALL_TOOLS_METADATA.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold shadow-xs">
          <Sparkles size={14} className="text-brand-500" />
          <span>Complete Privacy-First PDF Toolkit</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          <span className="text-emerald-700 font-bold">10 Client Tools Ready</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Every tool you need to work with PDFs in{' '}
          <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 bg-clip-text text-transparent">
            one place
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
          Merge, split, organize, rotate, watermark, and convert PDF documents directly in your browser. Fast, 100% free, and never uploaded to any remote server.
        </p>

        {/* Search input in Hero */}
        <div className="max-w-md mx-auto pt-2">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find any tool (e.g. merge, split, rotate, watermark)..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm placeholder-slate-400"
            />
          </div>
        </div>
      </section>

      {/* Category Navigation Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            All Tools ({ALL_TOOLS_METADATA.length})
          </button>
          {CATEGORY_LIST.map((cat) => {
            const count = ALL_TOOLS_METADATA.filter((t) => t.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shadow-xs ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon name={cat.iconName} size={14} />
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dynamic Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTools.map((tool: ToolMetadata) => {
            const cat = CATEGORIES[tool.category];
            const isClient = tool.mode === 'client';

            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 p-6 shadow-soft hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Icon & Badges */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${
                        isClient ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon name={tool.iconName} size={24} />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isClient && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                          In-Browser
                        </span>
                      )}
                      {tool.badge === 'Popular' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                          Popular
                        </span>
                      )}
                      {tool.mode === 'server' && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Server / Soon
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                      <span>{tool.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-brand-600">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">
                    {tool.category}
                  </span>
                  <span className="flex items-center gap-1 transition-transform group-hover:translate-x-1">
                    Open <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-soft flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Zero Server Storage</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your PDF files are processed using WebAssembly and client-side memory. Documents never leave your device.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-soft flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Lightning-Fast</h4>
              <p className="text-xs text-slate-500 mt-1">
                Zero waiting for network uploads. Even large multi-page PDF documents merge and split in milliseconds.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-soft flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">No Account or Limits</h4>
              <p className="text-xs text-slate-500 mt-1">
                No signups, subscriptions, or file caps. Use all 10 client tools unconditionally on any device.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
