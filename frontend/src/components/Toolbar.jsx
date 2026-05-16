import React from 'react';
import { MousePointer2, Square, Circle, Link2, Pause, Play, RotateCcw, Lock, Settings, StickyNote } from 'lucide-react';

const Toolbar = ({ activeTool, setActiveTool }) => {
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select & Move' },
    { id: 'box', icon: Square, label: 'Create Box' },
    { id: 'circle', icon: Circle, label: 'Create Circle' },
    { id: 'spring', icon: Link2, label: 'Create Spring/Constraint' },
    { id: 'lock', icon: Lock, label: 'Lock/Unlock Object' },
    { id: 'motor', icon: Settings, label: 'Add Motor (Spin)' },
    { id: 'note', icon: StickyNote, label: 'Add Sticky Note' },
  ];

  return (
    <div className="flex flex-col items-center py-6 gap-6 h-full">
      <div className="flex flex-col gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
              className={`p-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip */}
              <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-3 pb-4">
        <div className="w-10 h-px bg-gray-800 mx-auto"></div>
        
        <button title="Play/Pause Simulation" className="p-3 rounded-xl text-green-400 hover:bg-gray-800 hover:text-green-300 transition-colors">
          <Play size={20} />
        </button>
        <button title="Reset Simulation" className="p-3 rounded-xl text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
