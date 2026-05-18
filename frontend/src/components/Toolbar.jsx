import React from 'react';
import { MousePointer2, Square, Circle, Link2, Pause, Play, RotateCcw, Lock, Settings, StickyNote, Anchor, Scissors } from 'lucide-react';

const Toolbar = ({ activeTool, setActiveTool, isRunning, onPlayPause, onReset }) => {
  const tools = [
    { id: 'select',  icon: MousePointer2, label: 'Select & Move' },
    { id: 'box',     icon: Square,        label: 'Create Box' },
    { id: 'circle',  icon: Circle,        label: 'Create Circle' },
    { id: 'spring',  icon: Link2,         label: 'Spring / Soft Constraint' },
    { id: 'rope',    icon: Scissors,      label: 'Rope (Distance Constraint)' },
    { id: 'pivot',   icon: Anchor,        label: 'Pivot Joint' },
    { id: 'lock',    icon: Lock,          label: 'Lock / Unlock Object' },
    { id: 'motor',   icon: Settings,      label: 'Add Motor (Spin)' },
    { id: 'note',    icon: StickyNote,    label: 'Add Sticky Note' },
  ];

  return (
    <div className="flex flex-col items-center py-4 gap-4 h-full">
      <div className="flex flex-col gap-1.5 w-full px-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
              className={`p-2.5 rounded-xl transition-all duration-200 group relative w-full flex items-center justify-center ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {/* Tooltip */}
              <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 border border-gray-700">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-1.5 pb-4 px-2 w-full">
        <div className="w-10 h-px bg-gray-800 mx-auto mb-2"></div>

        {/* Play/Pause Button */}
        <button
          onClick={onPlayPause}
          title={isRunning ? 'Pause Simulation' : 'Resume Simulation'}
          className={`p-2.5 rounded-xl transition-all w-full flex items-center justify-center group relative ${
            isRunning
              ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
              : 'text-green-400 hover:bg-green-500/10 hover:text-green-300'
          }`}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 border border-gray-700">
            {isRunning ? 'Pause' : 'Resume'}
          </span>
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          title="Clear Canvas & Reset"
          className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full flex items-center justify-center group relative"
        >
          <RotateCcw size={18} />
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 border border-gray-700">
            Reset Canvas
          </span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
