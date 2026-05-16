import React, { useState, useEffect } from 'react';
import PhysicsCanvas from './components/PhysicsCanvas';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Toolbar from './components/Toolbar';
import ExperimentLibrary from './components/ExperimentLibrary';
import { io } from 'socket.io-client';

// Connect to backend
const socket = io('http://localhost:4000');

function App() {
  const [activeTool, setActiveTool] = useState('select');
  const [roomId, setRoomId] = useState('room_1');
  const [physicsData, setPhysicsData] = useState([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [triggerSave, setTriggerSave] = useState(0);

  useEffect(() => {
    socket.emit('join_room', roomId);
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  return (
    <div className="flex h-screen w-full bg-gray-950 text-white overflow-hidden">
      {/* Left Sidebar: Toolbar */}
      <div className="w-16 flex flex-col border-r border-gray-800 bg-gray-900 z-10 shadow-xl">
        <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Top Header */}
        <header className="h-14 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">V</div>
            <h1 className="font-semibold tracking-wide text-gray-100">VIRTUAL-LAB <span className="text-gray-500 text-sm font-normal">| Digital Twin</span></h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 mr-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-gray-400">Connected: {roomId}</span>
            </div>
            <button 
              onClick={() => setTriggerSave(Date.now())}
              className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors text-white font-medium shadow-sm border border-gray-700 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Save to Cloud
            </button>
            <button 
              onClick={() => setIsLibraryOpen(true)}
              className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors text-white font-medium shadow-sm border border-gray-700"
            >
              Library
            </button>
            <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors text-white font-medium shadow-lg shadow-indigo-500/20">
              Share Room
            </button>
          </div>
        </header>

        {/* Physics Canvas Area */}
        <div className="flex-1 relative bg-gray-950 overflow-hidden">
          <PhysicsCanvas 
            activeTool={activeTool} 
            socket={socket} 
            roomId={roomId}
            setPhysicsData={setPhysicsData}
            triggerSave={triggerSave}
          />
        </div>
      </div>

      {/* Right Sidebar: Analytics & Properties */}
      <div className="w-80 border-l border-gray-800 bg-gray-900 z-10 flex flex-col shadow-xl">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Analytics Dashboard</h2>
          <p className="text-xs text-gray-500">Real-time telemetry</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AnalyticsDashboard data={physicsData} />
        </div>
      </div>

      {/* Modals */}
      <ExperimentLibrary 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        onSelectExperiment={(data) => {
          socket.emit('load_experiment', { roomId, experimentData: data });
        }} 
      />
    </div>
  );
}

export default App;
