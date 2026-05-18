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
  const [showVectors, setShowVectors] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [triggerRecord, setTriggerRecord] = useState(null);
  const [isRunning, setIsRunning] = useState(true);
  const [triggerReset, setTriggerReset] = useState(0);
  const [selectedBodyId, setSelectedBodyId] = useState(null);

  const [userRole, setUserRole] = useState(null); // 'instructor' | 'student'
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [activeRooms, setActiveRooms] = useState([]);
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false);
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    
    // Simulate network delay for "AI Generation"
    setTimeout(() => {
      const p = aiPrompt.toLowerCase();
      let generatedData = { bodies: [], constraints: [] };
      
      const cw = 800; // approximate center width
      const ch = 600;
      
      if (p.includes('pendulum')) {
        generatedData.bodies.push({ id: 1, type: 'circle', x: cw/2, y: 100, radius: 10, isStatic: true, color: '#4b5563' });
        generatedData.bodies.push({ id: 2, type: 'circle', x: cw/2 + 200, y: 100, radius: 40, isStatic: false, color: '#ef4444', mass: 10 });
        generatedData.constraints.push({ id: 3, bodyAId: 1, bodyBId: 2, stiffness: 1 });
      } else if (p.includes('car') || p.includes('vehicle')) {
        generatedData.bodies.push({ id: 1, type: 'box', x: cw/2, y: ch/2, width: 200, height: 40, isStatic: false, color: '#3b82f6' }); // chassis
        generatedData.bodies.push({ id: 2, type: 'circle', x: cw/2 - 70, y: ch/2 + 30, radius: 30, isStatic: false, color: '#1f2937', friction: 0.9 }); // wheel 1
        generatedData.bodies.push({ id: 3, type: 'circle', x: cw/2 + 70, y: ch/2 + 30, radius: 30, isStatic: false, color: '#1f2937', friction: 0.9 }); // wheel 2
        generatedData.constraints.push({ id: 4, bodyAId: 1, bodyBId: 2, stiffness: 0.05 });
        generatedData.constraints.push({ id: 5, bodyAId: 1, bodyBId: 3, stiffness: 0.05 });
      } else if (p.includes('trebuchet') || p.includes('catapult') || p.includes('launch')) {
        generatedData.bodies.push({ id: 1, type: 'box', x: cw/2, y: ch-100, width: 20, height: 100, isStatic: true, color: '#4b5563' });
        generatedData.bodies.push({ id: 2, type: 'box', x: cw/2, y: ch-160, width: 400, height: 20, isStatic: false, color: '#8b5cf6' });
        generatedData.constraints.push({ id: 3, bodyAId: 1, bodyBId: 2, stiffness: 1 });
        generatedData.bodies.push({ id: 4, type: 'box', x: cw/2 - 180, y: ch-400, width: 80, height: 80, isStatic: false, color: '#ef4444', mass: 50 });
        generatedData.bodies.push({ id: 5, type: 'circle', x: cw/2 + 180, y: ch-180, radius: 20, isStatic: false, color: '#10b981', mass: 1 });
      } else if (p.includes('spring') || p.includes('oscillat') || p.includes('damping')) {
        // Static anchor
        generatedData.bodies.push({ id: 1, type: 'box', x: cw/2, y: 150, width: 40, height: 40, isStatic: true, color: '#4b5563' });
        // Lighter block so it bounces nicely instead of crashing to the floor
        generatedData.bodies.push({ id: 2, type: 'box', x: cw/2, y: 300, width: 60, height: 60, isStatic: false, color: '#ec4899', mass: 2, frictionAir: 0.02 });
        // Spring constraint with balanced stiffness
        generatedData.constraints.push({ 
          id: 3, 
          bodyAId: 1, 
          bodyBId: 2, 
          stiffness: 0.05, 
          damping: 0.05,
          length: 100, // Forces the spring to pull the block up
          render: { visible: false, strokeStyle: '#ec4899', type: 'spring' } 
        });
      } else {
        // random stack
        for (let i=1; i<=5; i++) {
          generatedData.bodies.push({ id: i, type: 'box', x: cw/2 + (Math.random()*20-10), y: ch/2 - i*70, width: 60, height: 60, isStatic: false, color: '#f59e0b' });
        }
      }
      
      socket.emit('load_experiment', { roomId, experimentData: generatedData });
      setIsAiLoading(false);
      setIsAiModalOpen(false);
      setAiPrompt('');
      
    }, 1500);
  };

  useEffect(() => {
    if (isJoined) {
      socket.emit('join_room', roomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, isJoined]);

  useEffect(() => {
    if (isJoined && userRole === 'instructor') {
      socket.emit('get_active_rooms');
      socket.on('active_rooms_list', setActiveRooms);
    }
    return () => {
      socket.off('active_rooms_list');
    };
  }, [isJoined, userRole]);

  if (!isJoined) {
    return (
      <div className="flex h-screen w-full bg-gray-950 text-white items-center justify-center font-sans">
        <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 w-96 max-w-md">
          <div className="flex flex-col items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-500/30">V</div>
            <h1 className="font-bold tracking-wider text-gray-100 text-2xl mt-2">VIRTUAL-LAB</h1>
            <p className="text-sm text-gray-500 text-center">Join a collaborative physics simulation</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Your Name</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. Marie Curie"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Select Role</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setUserRole('student'); setActiveTool('select'); }}
                  className={`flex-1 py-2.5 rounded-lg border font-medium transition-all ${userRole === 'student' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                >
                  Student
                </button>
                <button 
                  onClick={() => setUserRole('instructor')}
                  className={`flex-1 py-2.5 rounded-lg border font-medium transition-all ${userRole === 'instructor' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                >
                  Instructor
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Room ID</label>
              <input 
                type="text" 
                value={roomId} 
                onChange={e => setRoomId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
                placeholder="e.g. physics_101"
              />
            </div>

            <button 
              onClick={() => {
                if (username && userRole && roomId) setIsJoined(true);
              }}
              disabled={!username || !userRole || !roomId}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-500/25 flex justify-center items-center gap-2 text-white"
            >
              Enter Laboratory
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-950 text-white overflow-hidden">
      {/* Left Sidebar: Toolbar (Instructors Only) */}
      {userRole === 'instructor' && (
        <div className="w-16 flex flex-col border-r border-gray-800 bg-gray-900 z-10 shadow-xl">
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            isRunning={isRunning}
            onPlayPause={() => setIsRunning(r => !r)}
            onReset={() => { setTriggerReset(Date.now()); setSelectedBodyId(null); }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Top Header */}
        <header className="h-14 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">V</div>
            <h1 className="font-semibold tracking-wide text-gray-100">VIRTUAL-LAB <span className="text-gray-500 text-sm font-normal">| Digital Twin</span></h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 mr-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-gray-300 font-medium">{username} <span className="text-gray-500 font-normal">({userRole})</span> | <span className="text-gray-400 font-mono text-xs">{roomId}</span></span>
            </div>

            {userRole === 'instructor' && (
              <>
                <button 
                  onClick={() => setIsRoomsModalOpen(true)}
                  className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors text-white font-medium shadow-sm border border-gray-700 flex items-center gap-2"
                  title="Manage Classrooms"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                  Classrooms
                </button>
                <button 
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-md transition-all text-white font-medium shadow-lg shadow-purple-500/20 flex items-center gap-2 border border-purple-500/30"
                  title="Generate with AI"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                  Generate AI
                </button>
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
              </>
            )}
            <button 
              onClick={() => {
                const newRecordingState = !isRecording;
                setIsRecording(newRecordingState);
                setTriggerRecord({ isRecording: newRecordingState, timestamp: Date.now() });
              }}
              className={`px-4 py-1.5 rounded-md transition-colors font-medium shadow-sm border flex items-center gap-2 ${
                isRecording 
                  ? 'bg-red-600/20 text-red-400 border-red-500/50 hover:bg-red-600/30' 
                  : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
              }`}
            >
              {isRecording ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  Stop Recording
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                  Record
                </>
              )}
            </button>
            <button 
              onClick={() => setShowVectors(!showVectors)}
              className={`px-4 py-1.5 rounded-md transition-colors font-medium shadow-sm border flex items-center gap-2 ${
                showVectors ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
              }`}
              title="Toggle Force/Velocity Vectors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="19" x2="19" y2="5"></line><polyline points="5 5 19 5 19 19"></polyline></svg>
              Vectors
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
            showVectors={showVectors}
            triggerRecord={triggerRecord}
            isRunning={isRunning}
            triggerReset={triggerReset}
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
          <AnalyticsDashboard
            data={physicsData}
            selectedBodyId={selectedBodyId}
            onSelectBody={setSelectedBodyId}
          />
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

      {/* Classroom Manager Modal */}
      {isRoomsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                Multi-Room Classroom Management
              </h2>
              <button 
                onClick={() => setIsRoomsModalOpen(false)}
                className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-4 bg-gray-950 overflow-y-auto max-h-[60vh]">
              {activeRooms.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No active classrooms found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeRooms.map(room => (
                    <div key={room.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-200">{room.id}</h3>
                          <p className="text-xs text-gray-500">{room.objectCount} bodies simulated</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setRoomId(room.id);
                          setIsRoomsModalOpen(false);
                          socket.emit('join_room', room.id); // Re-join
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          roomId === room.id 
                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 cursor-default' 
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                        }`}
                        disabled={roomId === room.id}
                      >
                        {roomId === room.id ? 'Current Room' : 'Switch to Room'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden relative">
            
            {/* Ambient AI Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-purple-600/20 blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between p-5 border-b border-gray-800 z-10 relative">
              <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
                </div>
                AI Experiment Generator
              </h2>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 bg-gray-950 z-10 relative space-y-4">
              <p className="text-gray-400 text-sm">
                Describe the physics scenario you want to build. The AI will translate your prompt into a Matter.js physics environment.
              </p>
              
              <div className="relative">
                <textarea 
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  disabled={isAiLoading}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none min-h-[120px] placeholder-gray-600 disabled:opacity-50"
                  placeholder="e.g. 'Build a trebuchet that launches a projectile' or 'Create a simple pendulum'"
                />
              </div>

              <div className="flex gap-2 pb-2">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Try:</span>
                <button onClick={() => setAiPrompt("Build a spring with damping")} className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded transition-colors">Spring Oscillation</button>
                <button onClick={() => setAiPrompt("Build a trebuchet")} className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded transition-colors">Trebuchet</button>
                <button onClick={() => setAiPrompt("Create a simple pendulum")} className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded transition-colors">Pendulum</button>
              </div>

              <button
                onClick={handleAiGenerate}
                disabled={!aiPrompt.trim() || isAiLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/25 flex justify-center items-center gap-2 text-white"
              >
                {isAiLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Generating Simulation...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
