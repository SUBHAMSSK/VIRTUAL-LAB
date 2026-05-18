import React, { useState, useEffect } from 'react';
import { EXPERIMENT_TEMPLATES } from '../utils/templates';
import { X, PlayCircle, Cloud, BookOpen, Zap, Layers } from 'lucide-react';

const CATEGORY_COLORS = {
  Mechanics:   'text-pink-400 bg-pink-500/10 border-pink-500/20',
  Collisions:  'text-violet-400 bg-violet-500/10 border-violet-500/20',
  Structural:  'text-teal-400 bg-teal-500/10 border-teal-500/20',
  Oscillation: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Kinematics:  'text-sky-400 bg-sky-500/10 border-sky-500/20',
};

const DIFFICULTY_BADGE = {
  Beginner:     'bg-green-500/20 text-green-400 border-green-500/30',
  Intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Advanced:     'bg-red-500/20 text-red-400 border-red-500/30',
};

const ExperimentLibrary = ({ isOpen, onClose, onSelectExperiment }) => {
  const [cloudExperiments, setCloudExperiments] = useState([]);
  const [activeTab, setActiveTab] = useState('templates');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['All', ...new Set(EXPERIMENT_TEMPLATES.map(t => t.category))];

  useEffect(() => {
    if (isOpen && activeTab === 'cloud') {
      setIsLoading(true);
      fetch('http://localhost:4000/api/experiments')
        .then(res => res.json())
        .then(data => { setCloudExperiments(data); setIsLoading(false); })
        .catch(() => setIsLoading(false));
    }
  }, [isOpen, activeTab]);

  const filteredTemplates = activeCategory === 'All'
    ? EXPERIMENT_TEMPLATES
    : EXPERIMENT_TEMPLATES.filter(t => t.category === activeCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh]">

        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-start bg-gray-900/70 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen size={18} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">Experiment Library</h2>
              <p className="text-xs text-gray-500 mt-0.5">Browse, load, and share physics scenarios</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-900/50 flex-shrink-0">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'templates'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Layers size={15} /> Lab Templates
            <span className="bg-gray-800 text-gray-400 text-xs px-1.5 py-0.5 rounded-full font-mono">
              {EXPERIMENT_TEMPLATES.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'cloud'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Cloud size={15} /> Cloud Saves
            {cloudExperiments.length > 0 && (
              <span className="bg-indigo-500/20 text-indigo-400 text-xs px-1.5 py-0.5 rounded-full font-mono border border-indigo-500/30">
                {cloudExperiments.length}
              </span>
            )}
          </button>
        </div>

        {/* Category filter (templates tab only) */}
        {activeTab === 'templates' && (
          <div className="flex gap-2 px-5 py-3 border-b border-gray-800/60 overflow-x-auto flex-shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                  activeCategory === cat
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => { onSelectExperiment(template.data); onClose(); }}
                  className={`p-4 rounded-xl border ${template.borderColor} ${template.color} flex flex-col gap-3 group hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-100 leading-tight">{template.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0 ${DIFFICULTY_BADGE[template.difficulty]}`}>
                      {template.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 flex-1 leading-relaxed">{template.description}</p>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[template.category] || 'text-gray-400 bg-gray-800 border-gray-700'}`}>
                      {template.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-white/60 group-hover:text-white/90 transition-colors">
                      <PlayCircle size={14} /> Load
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'cloud' && (
            <div>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <svg className="animate-spin h-8 w-8 mb-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm">Fetching cloud saves...</p>
                </div>
              ) : cloudExperiments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                  <Cloud size={40} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium text-gray-500">No cloud saves yet</p>
                  <p className="text-xs mt-1">Use "Save to Cloud" in the header to persist experiments</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cloudExperiments.map((exp) => (
                    <div
                      key={exp._id}
                      onClick={() => { onSelectExperiment(exp.data); onClose(); }}
                      className="p-4 rounded-xl border border-indigo-500/40 bg-indigo-500/10 flex flex-col gap-3 group hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-100">{exp.name}</h3>
                        <Cloud size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-gray-400 flex-1">{exp.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 font-mono">
                          {new Date(exp.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                          <Zap size={13} /> Load Experiment
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentLibrary;
