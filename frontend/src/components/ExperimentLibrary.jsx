import React, { useState, useEffect } from 'react';
import { EXPERIMENT_TEMPLATES } from '../utils/templates';
import { X, PlayCircle, Cloud } from 'lucide-react';

const ExperimentLibrary = ({ isOpen, onClose, onSelectExperiment }) => {
  const [cloudExperiments, setCloudExperiments] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:4000/api/experiments')
        .then(res => res.json())
        .then(data => setCloudExperiments(data))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div>
            <h2 className="text-xl font-semibold text-gray-100">Experiment Library</h2>
            <p className="text-sm text-gray-500 mt-1">Load pre-configured physics scenarios or cloud saves</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {/* Cloud Experiments */}
          {cloudExperiments.map((exp) => (
            <div 
              key={exp._id}
              className="p-5 rounded-xl border border-indigo-500/50 bg-indigo-500/20 flex flex-col gap-3 group hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden"
              onClick={() => {
                onSelectExperiment(exp.data);
                onClose();
              }}
            >
              <div className="absolute top-3 right-3 text-indigo-400">
                <Cloud size={20} />
              </div>
              <h3 className="font-semibold text-gray-100 text-lg">{exp.name}</h3>
              <p className="text-sm text-gray-400 flex-1">{exp.description}</p>
              
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                <PlayCircle size={16} /> Load Cloud Experiment
              </div>
            </div>
          ))}

          {/* Static Templates */}
          {EXPERIMENT_TEMPLATES.map((template) => (
            <div 
              key={template.id}
              className={`p-5 rounded-xl border ${template.borderColor} ${template.color} flex flex-col gap-3 group hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden`}
              onClick={() => {
                onSelectExperiment(template.data);
                onClose();
              }}
            >
              <h3 className="font-semibold text-gray-100 text-lg">{template.name}</h3>
              <p className="text-sm text-gray-400 flex-1">{template.description}</p>
              
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                <PlayCircle size={16} /> Load Experiment
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ExperimentLibrary;
