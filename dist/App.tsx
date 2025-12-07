/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Layout, Box, Image as ImageIcon, Wand2, Layers, Plus, Trash2, Download, History, Sparkles, Shirt, Move, Maximize, RotateCcw, Zap, Cpu, ArrowRight, Globe, Scan, Camera, Aperture, Repeat, SprayCan, Triangle, Package, Menu, X, Check, MousePointer2, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './components/Button';
import { FileUploader } from './components/FileUploader';
import { generateMockup, generateAsset, generateRealtimeComposite, generateProductPhotography } from './services/geminiService';
import { Asset, GeneratedMockup, AppView, LoadingState, PlacedLayer } from './types';
import { useApiKey } from './hooks/useApiKey';
import ApiKeyDialog from './components/ApiKeyDialog';

// --- Theme Management ---
type Theme = 'light' | 'dark' | 'system';

const ThemeToggle = ({ current, onChange }: { current: Theme, onChange: (t: Theme) => void }) => {
  return (
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <button 
        onClick={() => onChange('light')}
        className={`p-1.5 rounded-md transition-all ${current === 'light' ? 'bg-white dark:bg-zinc-700 shadow text-brand-600 dark:text-brand-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        title="Light Mode"
      >
        <Sun size={14} />
      </button>
      <button 
        onClick={() => onChange('system')}
        className={`p-1.5 rounded-md transition-all ${current === 'system' ? 'bg-white dark:bg-zinc-700 shadow text-brand-600 dark:text-brand-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        title="System Preference"
      >
        <Monitor size={14} />
      </button>
      <button 
        onClick={() => onChange('dark')}
        className={`p-1.5 rounded-md transition-all ${current === 'dark' ? 'bg-white dark:bg-zinc-700 shadow text-brand-600 dark:text-brand-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        title="Dark Mode"
      >
        <Moon size={14} />
      </button>
    </div>
  );
}

// --- Intro Animation Component ---

const IntroSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'enter' | 'wait' | 'spray' | 'admire' | 'exit' | 'prism' | 'explode'>('enter');

  useEffect(() => {
    // Cinematic Timeline
    const schedule = [
      { t: 100, fn: () => setPhase('enter') },      // Bot walks in
      { t: 1800, fn: () => setPhase('wait') },      // Stops, looks around
      { t: 2400, fn: () => setPhase('spray') },     // Spray can enters & sprays
      { t: 4000, fn: () => setPhase('admire') },    // Spray done, bot looks at self
      { t: 5000, fn: () => setPhase('exit') },      // Bot runs away
      { t: 5600, fn: () => setPhase('prism') },     // Logo forms
      { t: 7800, fn: () => setPhase('explode') },   // Boom
      { t: 8500, fn: () => onComplete() }           // Done
    ];

    const timers = schedule.map(s => setTimeout(s.fn, s.t));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-zinc-50 dark:bg-black flex items-center justify-center overflow-hidden font-sans select-none
      ${phase === 'explode' ? 'animate-[fadeOut_1s_ease-out_forwards] pointer-events-none' : ''}
    `}>
      {/* Flash Overlay for Explosion */}
      <div className={`absolute inset-0 bg-brand-500 pointer-events-none z-50 transition-opacity duration-300 ease-out ${phase === 'explode' ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"></div>

      {/* STAGE AREA - Scaled for mobile */}
      <div className="relative w-full max-w-4xl h-96 flex items-center justify-center scale-[0.6] md:scale-100">

        {/* --- CHARACTER: THE BOX BOT --- */}
        {(phase !== 'prism' && phase !== 'explode') && (
          <div className={`relative z-10 flex flex-col items-center transition-transform will-change-transform
             ${phase === 'enter' ? 'animate-[hopIn_1.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards]' : ''}
             ${phase === 'exit' ? 'animate-[anticipateSprint_0.8s_ease-in_forwards]' : ''}
          `}>
             {/* Body */}
             <div className={`w-32 h-36 bg-white dark:bg-zinc-100 rounded-xl relative overflow-hidden shadow-2xl transition-all duration-300 border-4
                ${phase === 'spray' || phase === 'admire' || phase === 'exit' 
                  ? 'border-brand-500 shadow-[0_0_40px_rgba(255,213,0,0.5)]' 
                  : 'border-zinc-300'}
             `}>
                
                {/* Blank Package Tape (Hidden after spray) */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-zinc-200/50 border-x border-zinc-300/50 transition-opacity duration-200 ${phase === 'spray' || phase === 'admire' || phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}></div>

                {/* Face Screen */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-10 bg-zinc-800 rounded-md flex items-center justify-center gap-4 overflow-hidden border border-zinc-700 shadow-inner z-20">
                   {/* Eyes */}
                   <div className={`w-2 h-2 bg-brand-400 rounded-full transition-all duration-300 ${phase === 'spray' ? 'scale-y-10 bg-white' : 'animate-pulse'}`}></div>
                   <div className={`w-2 h-2 bg-brand-400 rounded-full transition-all duration-300 ${phase === 'spray' ? 'scale-y-10 bg-white' : 'animate-pulse'}`}></div>
                </div>

                {/* BRAND REVEAL: Logo & Color Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-brand-400 via-brand-500 to-yellow-600 transition-opacity duration-500 ${phase === 'spray' || phase === 'admire' || phase === 'exit' ? 'opacity-100' : 'opacity-0'}`}></div>
                
                {/* White Flash on Transform */}
                <div className={`absolute inset-0 bg-white mix-blend-overlay pointer-events-none ${phase === 'spray' ? 'animate-[flash_0.2s_ease-out]' : 'opacity-0'}`}></div>

                {/* Logo Icon */}
                <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500 transform z-20
                   ${phase === 'spray' || phase === 'admire' || phase === 'exit' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-4'}
                `}>
                   <div className="w-10 h-10 bg-white text-brand-600 rounded flex items-center justify-center shadow-lg">
                      <Package size={24} strokeWidth={3} />
                   </div>
                </div>
             </div>

             {/* Legs */}
             <div className="flex gap-10 -mt-1 z-0">
                <div className={`w-3 h-8 bg-zinc-800 dark:bg-zinc-800 rounded-b-full origin-top ${phase === 'enter' ? 'animate-[legMove_0.2s_infinite_alternate]' : ''} ${phase === 'exit' ? 'animate-[legMove_0.1s_infinite_alternate]' : ''}`}></div>
                <div className={`w-3 h-8 bg-zinc-800 dark:bg-zinc-800 rounded-b-full origin-top ${phase === 'enter' ? 'animate-[legMove_0.2s_infinite_alternate-reverse]' : ''} ${phase === 'exit' ? 'animate-[legMove_0.1s_infinite_alternate-reverse]' : ''}`}></div>
             </div>
          </div>
        )}

        {/* --- SPRAY CAN ACTOR --- */}
        {phase === 'spray' && (
          <div className="absolute z-20 animate-[swoopIn_0.4s_cubic-bezier(0.17,0.67,0.83,0.67)_forwards]" style={{ right: '22%', top: '5%' }}>
             <div className="relative animate-[shake_0.15s_infinite]">
                <SprayCan size={80} className="text-zinc-400 dark:text-zinc-300 fill-zinc-800 rotate-[-15deg] drop-shadow-2xl" />
                
                {/* Spray Nozzle Mist */}
                <div className="absolute top-0 -left-4 w-6 h-6 bg-brand-200 rounded-full blur-md animate-ping"></div>
                
                {/* Particle Stream */}
                <div className="absolute top-4 -left-8 w-40 h-40 pointer-events-none overflow-visible">
                   {[...Array(20)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute w-2 h-2 bg-brand-500 rounded-full animate-[sprayParticle_0.4s_linear_forwards]"
                        style={{ 
                           top: Math.random() * 20, 
                           left: 0,
                           animationDelay: `${Math.random() * 0.3}s`,
                        }}
                      />
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* --- FINALE --- */}
        {(phase === 'prism' || phase === 'explode') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
             {/* Logo Icon */}
             <div className={`relative w-32 h-32 animate-[spinAppear_1.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]`}>
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_50px_rgba(255,213,0,0.5)]">
                   <defs>
                      <linearGradient id="prismStroke" x1="0" y1="0" x2="1" y2="1">
                         <stop offset="0%" stopColor="#FFD500" />
                         <stop offset="100%" stopColor="#FF6600" />
                      </linearGradient>
                   </defs>
                   <path 
                      d="M50 10 L90 85 L10 85 Z" 
                      fill="none" 
                      stroke="url(#prismStroke)" 
                      strokeWidth="4" 
                      strokeLinejoin="round"
                      className="animate-[drawStroke_1s_ease-out_forwards]"
                   />
                   <path 
                      d="M50 10 L50 85 M50 50 L90 85 M50 50 L10 85" 
                      stroke="url(#prismStroke)" 
                      strokeWidth="1.5" 
                      className="opacity-40"
                   />
                </svg>
             </div>
             
             {/* Text Reveal */}
             <div className="text-center animate-[popIn_0.8s_cubic-bezier(0.17,0.67,0.83,0.67)_0.5s_forwards] opacity-0">
                <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2">SKU FOUNDRY</h1>
                <p className="text-sm text-brand-600 dark:text-brand-400 font-mono tracking-[0.3em] uppercase">AI Product Visualization</p>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

// --- UI Components ---

const NavButton = ({ icon, label, active, onClick, number }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, number?: number }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
      ${active 
        ? 'bg-brand-500/10 text-brand-700 dark:text-brand-400 border-l-2 border-brand-500' 
        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
  >
    <span className={`${active ? 'text-brand-600 dark:text-brand-400' : 'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400'} transition-colors`}>
      {icon}
    </span>
    <span className="font-medium text-sm tracking-wide flex-1 text-left">{label}</span>
    {number && (
      <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded min-w-[1.5rem] text-center transition-colors 
        ${active ? 'bg-brand-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500'}`}>
        {number}
      </span>
    )}
  </button>
);

const WorkflowStepper = ({ currentView, onViewChange }: { currentView: AppView, onViewChange: (view: AppView) => void }) => {
  const steps = [
    { id: 'assets', label: 'Upload Assets', number: 1 },
    { id: 'studio', label: 'Design Mockup', number: 2 },
    { id: 'gallery', label: 'Download Result', number: 3 },
  ];

  const viewOrder = ['assets', 'studio', 'gallery'];
  const currentIndex = viewOrder.indexOf(currentView);
  const progress = Math.max(0, (currentIndex / (steps.length - 1)) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 hidden md:block animate-fade-in px-4">
      <div className="relative">
         {/* Background Track */}
         <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 rounded-full"></div>
         
         {/* Active Progress Bar */}
         <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-brand-500 to-yellow-600 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
         ></div>

         <div className="relative flex justify-between w-full">
            {steps.map((step, index) => {
               const isCompleted = currentIndex > index;
               const isCurrent = currentIndex === index;
               
               return (
                  <button 
                    key={step.id}
                    onClick={() => onViewChange(step.id as AppView)}
                    className={`group flex flex-col items-center focus:outline-none relative z-10 cursor-pointer`}
                  >
                     <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300
                        ${isCurrent 
                           ? 'border-brand-500 text-black bg-white dark:bg-zinc-950 shadow-[0_0_20px_rgba(255,213,0,0.5)] scale-110' 
                           : isCompleted 
                              ? 'border-brand-600 bg-brand-500 text-black' 
                              : 'border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-400 group-hover:border-zinc-400 dark:group-hover:border-zinc-600'}
                     `}>
                        {isCompleted ? (
                           <Check size={18} strokeWidth={3} />
                        ) : (
                           <span className="text-sm font-bold font-mono">{step.number}</span>
                        )}
                     </div>
                     <span className={`
                        absolute top-14 text-xs font-medium tracking-wider transition-all duration-300 whitespace-nowrap
                        ${isCurrent ? 'text-brand-600 dark:text-brand-400 opacity-100 transform translate-y-0' : isCompleted ? 'text-zinc-500 dark:text-zinc-400 opacity-80' : 'text-zinc-400 dark:text-zinc-600 opacity-60 group-hover:opacity-100'}
                     `}>
                        {step.label}
                     </span>
                  </button>
               )
            })}
         </div>
      </div>
    </div>
  )
};

// Helper component for Asset Sections
const AssetSection = ({ 
  title, 
  icon, 
  type, 
  assets, 
  onAdd, 
  onRemove,
  validateApiKey,
  onApiError
}: { 
  title: string, 
  icon: React.ReactNode, 
  type: 'logo' | 'product', 
  assets: Asset[], 
  onAdd: (a: Asset) => void, 
  onRemove: (id: string) => void,
  validateApiKey: () => Promise<boolean>,
  onApiError: (e: any) => void
}) => {
  const [mode, setMode] = useState<'upload' | 'generate'>('upload');
  const [genPrompt, setGenPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!genPrompt) return;
    
    // Validate API key first
    if (!(await validateApiKey())) return;

    setIsGenerating(true);
    try {
      const b64 = await generateAsset(genPrompt, type);
      onAdd({
        id: Math.random().toString(36).substring(7),
        type,
        name: `AI Generated ${type}`,
        data: b64,
        mimeType: 'image/png'
      });
      setGenPrompt('');
    } catch (e: any) {
      console.error(e);
      onApiError(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">{icon} {title}</h2>
          <span className="text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400">{assets.length} items</span>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 overflow-y-auto max-h-[400px] pr-2">
          {assets.map(asset => (
            <div key={asset.id} className="relative group aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <img src={asset.data} className="w-full h-full object-contain p-2" alt={asset.name} />
                <button onClick={() => onRemove(asset.id)} className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={12} />
                </button>
            </div>
          ))}
          {assets.length === 0 && (
            <div className="col-span-2 sm:col-span-3 flex flex-col items-center justify-center h-32 text-zinc-400 dark:text-zinc-600 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
              <p className="text-sm">No {type}s yet</p>
            </div>
          )}
      </div>

      {/* Creation Area */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-4 mb-4">
           <button 
             onClick={() => setMode('upload')}
             className={`text-sm font-medium pb-1 border-b-2 transition-colors ${mode === 'upload' ? 'border-brand-500 text-brand-700 dark:text-white' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
           >
             Upload
           </button>
           <button 
             onClick={() => setMode('generate')}
             className={`text-sm font-medium pb-1 border-b-2 transition-colors ${mode === 'generate' ? 'border-brand-500 text-brand-700 dark:text-white' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
           >
             Generate with AI
           </button>
        </div>

        {mode === 'upload' ? (
           <FileUploader label={`Upload ${type}`} onFileSelect={(f) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                onAdd({
                  id: Math.random().toString(36).substring(7),
                  type,
                  name: f.name,
                  data: e.target?.result as string,
                  mimeType: f.type
                });
              };
              reader.readAsDataURL(f);
           }} />
        ) : (
           <div className="space-y-3">
              <textarea 
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                placeholder={`Describe the ${type} you want to create...`}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-base text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 resize-none h-24 placeholder:text-zinc-400"
              />
              <Button 
                onClick={handleGenerate} 
                isLoading={isGenerating} 
                disabled={!genPrompt}
                className="w-full"
                icon={<Sparkles size={16} />}
              >
                Generate {type}
              </Button>
           </div>
        )}
      </div>
    </div>
  );
};


// --- App Component ---

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<Theme>('light'); // Default light as requested

  // Authenticated User (Mock for development)
  const userEmail = "george@socialab.gr";

  // Initial Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const [showIntro, setShowIntro] = useState(true);
  const [view, setView] = useState<AppView>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [generatedMockups, setGeneratedMockups] = useState<GeneratedMockup[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMockup, setSelectedMockup] = useState<GeneratedMockup | null>(null); // State for lightbox

  // Form states for generation
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [placedLogos, setPlacedLogos] = useState<PlacedLayer[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState<LoadingState>({ isGenerating: false, message: '' });

  // Photoshoot Form State
  const [photoshootForm, setPhotoshootForm] = useState({
     projectName: '',
     instructions: '',
     count: 1,
     ratio: '1:1' as '1:1' | '16:9' | '9:16',
     productPhotos: [] as Asset[],
     referencePhotos: [] as Asset[]
  });
  const [isProcessingPhotoshoot, setIsProcessingPhotoshoot] = useState(false);

  // API Key Management
  const { showApiKeyDialog, setShowApiKeyDialog, validateApiKey, handleApiKeyDialogContinue } = useApiKey();

  // API Error Handling Logic
  const handleApiError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    let shouldOpenDialog = false;

    // Check for specific Server-side Error Signatures
    if (errorMessage.includes('Requested entity was not found')) {
      console.warn('Model not found - likely a billing/key issue');
      shouldOpenDialog = true;
    } else if (
      errorMessage.includes('API_KEY_INVALID') ||
      errorMessage.includes('API key not valid') ||
      errorMessage.includes('PERMISSION_DENIED') || 
      errorMessage.includes('403')
    ) {
      console.warn('Invalid API Key or Permissions');
      shouldOpenDialog = true;
    }

    if (shouldOpenDialog) {
      setShowApiKeyDialog(true);
    } else {
      alert(`Operation failed: ${errorMessage}`);
    }
  };

  // State for Dragging
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<{ uid: string, startX: number, startY: number, initX: number, initY: number } | null>(null);

  // Demo assets on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 9000);
    return () => clearTimeout(timer);
  }, []);

  // -- PHOTOSHOOT LOGIC --
  const handlePhotoshootSubmit = async () => {
    if (!photoshootForm.projectName || !photoshootForm.instructions) {
      alert("Please complete the project details.");
      return;
    }
    if (photoshootForm.productPhotos.length === 0) {
      alert("Please upload at least one product photo.");
      return;
    }

    if (!(await validateApiKey())) return;

    setIsProcessingPhotoshoot(true);
    setLoading({ isGenerating: true, message: `Starting photoshoot for ${photoshootForm.projectName}...` });

    try {
      // Loop for 'count'
      for (let i = 0; i < photoshootForm.count; i++) {
         setLoading({ isGenerating: true, message: `Capturing shot ${i+1} of ${photoshootForm.count}...` });
         
         const imageUrl = await generateProductPhotography(
            photoshootForm.productPhotos,
            photoshootForm.referencePhotos,
            photoshootForm.instructions,
            photoshootForm.ratio
         );

         const newMockup: GeneratedMockup = {
            id: Math.random().toString(36).substring(7),
            imageUrl: imageUrl,
            prompt: `Photoshoot: ${photoshootForm.projectName} - ${photoshootForm.instructions.substring(0, 50)}...`,
            createdAt: Date.now(),
            layers: []
         };

         setGeneratedMockups(prev => [newMockup, ...prev]);
      }
      setView('gallery');
    } catch (e) {
      console.error(e);
      handleApiError(e);
    } finally {
      setIsProcessingPhotoshoot(false);
      setLoading({ isGenerating: false, message: '' });
    }
  };


  // -- LOGO PLACEMENT HANDLERS --

  const addLogoToCanvas = (assetId: string) => {
    // Add new instance of logo to canvas at center
    const newLayer: PlacedLayer = {
      uid: Math.random().toString(36).substr(2, 9),
      assetId,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0
    };
    setPlacedLogos(prev => [...prev, newLayer]);
  };

  const removeLogoFromCanvas = (uid: string, e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setPlacedLogos(prev => prev.filter(l => l.uid !== uid));
  };

  const handleStart = (clientX: number, clientY: number, layer: PlacedLayer) => {
    setDraggedItem({
      uid: layer.uid,
      startX: clientX,
      startY: clientY,
      initX: layer.x,
      initY: layer.y
    });
  };

  const handleMouseDown = (e: React.MouseEvent, layer: PlacedLayer) => {
    e.preventDefault();
    e.stopPropagation();
    handleStart(e.clientX, e.clientY, layer);
  };

  const handleTouchStart = (e: React.TouchEvent, layer: PlacedLayer) => {
    e.stopPropagation(); // Prevent scrolling initiation if possible
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY, layer);
  };

  const handleWheel = (e: React.WheelEvent, layerId: string) => {
     e.stopPropagation();
     // Simple scale on scroll
     const delta = e.deltaY > 0 ? -0.1 : 0.1;
     setPlacedLogos(prev => prev.map(l => {
        if (l.uid !== layerId) return l;
        const newScale = Math.max(0.2, Math.min(3.0, l.scale + delta));
        return { ...l, scale: newScale };
     }));
  };

  // Global mouse/touch move for dragging
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!draggedItem || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = clientX - draggedItem.startX;
      const deltaY = clientY - draggedItem.startY;

      // Convert pixels to percentage
      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;

      setPlacedLogos(prev => prev.map(l => {
        if (l.uid !== draggedItem.uid) return l;
        return {
          ...l,
          x: Math.max(0, Math.min(100, draggedItem.initX + deltaXPercent)),
          y: Math.max(0, Math.min(100, draggedItem.initY + deltaYPercent))
        };
      }));
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
      setDraggedItem(null);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (draggedItem) {
         e.preventDefault(); // Prevent scrolling while dragging
         handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      setDraggedItem(null);
    };

    if (draggedItem) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false }); // passive: false needed for preventDefault
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [draggedItem]);


  const handleGenerate = async () => {
    // We don't return early for empty selections here so we can give better user feedback
    if (!selectedProductId && placedLogos.length === 0) {
        // Although button is disabled, safety check
        return;
    }
    
    const product = assets.find(a => a.id === selectedProductId);
    if (!product) {
        alert("Selected product not found. Please select a product.");
        // Deselect the invalid ID so the UI updates
        setSelectedProductId(null);
        return;
    }

    // Prepare all layers
    const layers = placedLogos.map(layer => {
        const asset = assets.find(a => a.id === layer.assetId);
        return asset ? { asset, placement: layer } : null;
    }).filter(Boolean) as { asset: Asset, placement: PlacedLayer }[];

    if (layers.length === 0) {
         alert("No valid logos found on canvas. Please add a logo.");
         return;
    }

    // Check API Key before proceeding
    if (!(await validateApiKey())) {
      return;
    }

    const currentPrompt = prompt;

    setLoading({ isGenerating: true, message: 'Analyzing composite geometry...' });
    try {
      const resultImage = await generateMockup(product, layers, currentPrompt);
      
      const newMockup: GeneratedMockup = {
        id: Math.random().toString(36).substring(7),
        imageUrl: resultImage,
        prompt: currentPrompt,
        createdAt: Date.now(),
        layers: placedLogos, // Save the layout
        productId: selectedProductId
      };
      
      setGeneratedMockups(prev => [newMockup, ...prev]);
      setView('gallery');
    } catch (e: any) {
      console.error(e);
      handleApiError(e);
    } finally {
      setLoading({ isGenerating: false, message: '' });
    }
  };

  if (showIntro) {
    return <IntroSequence onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans flex overflow-hidden relative transition-colors duration-300">
      
      {/* API Key Dialog */}
      {showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
      )}

      {/* Sidebar Navigation (Desktop) */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 hidden md:flex flex-col backdrop-blur-md">
        <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6">
          <Package className="text-brand-500 mr-2" />
          <span className="font-bold text-lg tracking-tight">SKU FOUNDRY</span>
        </div>

        <div className="p-4 space-y-2 flex-1">
          {/* Authenticated User Display */}
          <div className="mb-6 px-2">
             <div className="text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-2 px-1">Authenticated User</div>
             <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm animate-pulse"></div>
                <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 truncate w-full" title={userEmail}>
                  {userEmail}
                </span>
             </div>
          </div>

          <NavButton 
            icon={<Layout size={18} />} 
            label="Dashboard" 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
          />
          <NavButton 
            icon={<Camera size={18} />} 
            label="Photoshoot" 
            active={view === 'photoshoot'} 
            onClick={() => setView('photoshoot')} 
          />
          <NavButton 
            icon={<Box size={18} />} 
            label="Assets" 
            active={view === 'assets'} 
            number={1}
            onClick={() => setView('assets')} 
          />
          <NavButton 
            icon={<Wand2 size={18} />} 
            label="Studio" 
            active={view === 'studio'} 
            number={2}
            onClick={() => setView('studio')} 
          />
          <NavButton 
            icon={<ImageIcon size={18} />} 
            label="Gallery" 
            active={view === 'gallery'} 
            number={3}
            onClick={() => setView('gallery')} 
          />
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
           {/* Theme Toggle */}
           <div className="flex items-center justify-between px-2">
             <span className="text-xs font-medium text-zinc-500">Appearance</span>
             <ThemeToggle current={theme} onChange={setTheme} />
           </div>

          <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center">
             <Button size="sm" variant="outline" className="w-full text-xs">Documentation</Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center">
          <Package className="text-brand-500 mr-2" />
          <span className="font-bold text-lg">SKU FOUNDRY</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-xl p-4 animate-fade-in flex flex-col">
          <div className="space-y-2">
            <NavButton 
              icon={<Layout size={18} />} 
              label="Dashboard" 
              active={view === 'dashboard'} 
              onClick={() => { setView('dashboard'); setIsMobileMenuOpen(false); }} 
            />
             <NavButton 
              icon={<Camera size={18} />} 
              label="Photoshoot" 
              active={view === 'photoshoot'} 
              onClick={() => { setView('photoshoot'); setIsMobileMenuOpen(false); }} 
            />
            <NavButton 
              icon={<Box size={18} />} 
              label="Assets" 
              active={view === 'assets'} 
              number={1}
              onClick={() => { setView('assets'); setIsMobileMenuOpen(false); }} 
            />
            <NavButton 
              icon={<Wand2 size={18} />} 
              label="Studio" 
              active={view === 'studio'} 
              number={2}
              onClick={() => { setView('studio'); setIsMobileMenuOpen(false); }} 
            />
            <NavButton 
              icon={<ImageIcon size={18} />} 
              label="Gallery" 
              active={view === 'gallery'} 
              number={3}
              onClick={() => { setView('gallery'); setIsMobileMenuOpen(false); }} 
            />
          </div>
          
          <div className="mt-auto pb-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <div className="flex justify-center mb-6">
                <ThemeToggle current={theme} onChange={setTheme} />
              </div>
              <p className="text-xs text-zinc-500 text-center mb-4">SKU FOUNDRY Mobile v1.0</p>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMockup && (
        <div 
          className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" 
          onClick={() => setSelectedMockup(null)}
        >
          <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedMockup(null)}
              className="absolute top-4 right-4 md:top-0 md:-right-12 p-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors z-50 border border-zinc-200 dark:border-zinc-700"
            >
              <X size={24} />
            </button>

            {/* Image Container */}
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-lg">
              <img 
                src={selectedMockup.imageUrl} 
                alt="Full size preview" 
                className="max-w-full max-h-[85vh] object-contain shadow-2xl" 
              />
            </div>

            {/* Caption / Actions */}
            <div className="mt-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-700 px-6 py-3 rounded-full flex items-center gap-4">
               <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-[200px] md:max-w-md truncate">
                 {selectedMockup.prompt || "Generated Mockup"}
               </p>
               <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>
               <a 
                 href={selectedMockup.imageUrl} 
                 download={`mockup-${selectedMockup.id}.png`}
                 className="text-brand-600 dark:text-brand-400 hover:text-brand-500 text-sm font-medium flex items-center gap-2"
               >
                 <Download size={16} />
                 Download
               </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8">
           <div className="text-sm text-zinc-500 dark:text-zinc-400 breadcrumbs">
              <span className="opacity-50">App</span> 
              <span className="mx-2">/</span> 
              <span className="text-zinc-900 dark:text-white capitalize">{view}</span>
           </div>
           <div className="flex items-center gap-4">
              <Button size="sm" variant="ghost" icon={<Sparkles size={16}/>}>Credits: ∞</Button>
           </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 md:p-12">
           
           {/* --- DASHBOARD VIEW --- */}
           {view === 'dashboard' && (
              <div className="animate-fade-in space-y-8">
                 <div className="text-center py-12">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 text-zinc-900 dark:text-white">
                       AI-enabled dashboard <br/>
                       <span className="hero-gradient">for today's marketer.</span>
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
                       Upload your logos and products, and let our AI composite them perfectly with realistic lighting, shadows, and warping.
                    </p>
                    <Button size="lg" onClick={() => setView('assets')} icon={<ArrowRight size={20} />}>
                       Start Creating
                    </Button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                       { icon: <Box className="text-brand-600 dark:text-brand-400" />, title: 'Asset Management', desc: 'Organize logos and product bases.' },
                       { icon: <Wand2 className="text-zinc-600 dark:text-zinc-400" />, title: 'AI Compositing', desc: 'Smart blending and surface mapping.' },
                       { icon: <Download className="text-zinc-600 dark:text-zinc-400" />, title: 'High-Res Export', desc: 'Production-ready visuals.' },
                       { icon: <Camera className="text-zinc-600 dark:text-zinc-400" />, title: 'Product Photography', desc: 'Generate professional product shots.', action: () => setView('photoshoot') }
                    ].map((feat, i) => (
                       <div key={i} onClick={feat.action} className={`p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/30 transition-colors ${feat.action ? 'cursor-pointer hover:bg-white/80 dark:hover:bg-zinc-900/80' : ''}`}>
                          <div className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-900 w-fit rounded-lg">{feat.icon}</div>
                          <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">{feat.title}</h3>
                          <p className="text-zinc-500 dark:text-zinc-500">{feat.desc}</p>
                       </div>
                    ))}
                 </div>
                 
                 <footer className="mt-20 pt-8 border-t border-zinc-200 dark:border-zinc-900 text-center">
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
                       "By using this app, you confirm that you have the necessary rights to any content that you upload. Do not generate content that infringes on others’ intellectual property or privacy rights. Your use of this generative AI service is subject to our Prohibited Use Policy.
                       <br className="hidden md:block" />
                       Please note that uploads from Google Workspace may be used to develop and improve Google products and services in accordance with our terms."
                    </p>
                 </footer>
              </div>
           )}

           {/* --- PHOTOSHOOT VIEW --- */}
           {view === 'photoshoot' && (
             <div className="animate-fade-in max-w-3xl mx-auto">
                <div className="mb-8">
                   <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                     <Camera className="text-brand-500" />
                     Product Style Photography
                   </h2>
                   <p className="text-zinc-500 dark:text-zinc-400 mt-2">Generate high-end product photography using AI references.</p>
                </div>

                <div className="glass-panel p-8 rounded-2xl space-y-8">
                   
                   {/* Project Name */}
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Project Name</label>
                      <input 
                        type="text" 
                        value={photoshootForm.projectName}
                        onChange={e => setPhotoshootForm(prev => ({...prev, projectName: e.target.value}))}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="e.g. Summer Campaign 2024"
                      />
                   </div>

                   {/* Product Photos */}
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                         <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Product Photos (Max 6)</label>
                         <span className="text-xs text-zinc-500">{photoshootForm.productPhotos.length}/6</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                         {photoshootForm.productPhotos.map((img, idx) => (
                           <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 group">
                              <img src={img.data} className="w-full h-full object-cover" alt="product" />
                              <button 
                                onClick={() => setPhotoshootForm(prev => ({...prev, productPhotos: prev.productPhotos.filter((_, i) => i !== idx)}))}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12}/>
                              </button>
                           </div>
                         ))}
                         {photoshootForm.productPhotos.length < 6 && (
                            <div className="aspect-square">
                               <FileUploader 
                                 label="Add" 
                                 onFileSelect={(f) => {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      const newAsset: Asset = {
                                        id: Math.random().toString(),
                                        type: 'product',
                                        name: f.name,
                                        data: e.target?.result as string,
                                        mimeType: f.type
                                      };
                                      setPhotoshootForm(prev => ({...prev, productPhotos: [...prev.productPhotos, newAsset]}));
                                    };
                                    reader.readAsDataURL(f);
                                 }} 
                               />
                            </div>
                         )}
                      </div>
                   </div>

                   {/* Reference Photos */}
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                         <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Reference Photos (Max 6)</label>
                         <span className="text-xs text-zinc-500">{photoshootForm.referencePhotos.length}/6</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                         {photoshootForm.referencePhotos.map((img, idx) => (
                           <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 group">
                              <img src={img.data} className="w-full h-full object-cover" alt="reference" />
                              <button 
                                onClick={() => setPhotoshootForm(prev => ({...prev, referencePhotos: prev.referencePhotos.filter((_, i) => i !== idx)}))}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12}/>
                              </button>
                           </div>
                         ))}
                         {photoshootForm.referencePhotos.length < 6 && (
                            <div className="aspect-square">
                               <FileUploader 
                                 label="Add" 
                                 onFileSelect={(f) => {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      const newAsset: Asset = {
                                        id: Math.random().toString(),
                                        type: 'reference',
                                        name: f.name,
                                        data: e.target?.result as string,
                                        mimeType: f.type
                                      };
                                      setPhotoshootForm(prev => ({...prev, referencePhotos: [...prev.referencePhotos, newAsset]}));
                                    };
                                    reader.readAsDataURL(f);
                                 }} 
                               />
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Count Selection */}
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">How many shots?</label>
                         <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                               <button 
                                 key={num}
                                 onClick={() => setPhotoshootForm(prev => ({...prev, count: num}))}
                                 className={`w-10 h-10 rounded-lg font-medium transition-colors border ${photoshootForm.count === num ? 'bg-brand-500 text-black border-brand-500' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'}`}
                               >
                                 {num}
                               </button>
                            ))}
                         </div>
                      </div>

                      {/* Aspect Ratio */}
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Aspect Ratio</label>
                         <div className="flex gap-2">
                            {['1:1', '16:9', '9:16'].map(r => (
                               <button 
                                 key={r}
                                 onClick={() => setPhotoshootForm(prev => ({...prev, ratio: r as any}))}
                                 className={`flex-1 py-2 rounded-lg font-medium transition-colors border ${photoshootForm.ratio === r ? 'bg-brand-500 text-black border-brand-500' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'}`}
                               >
                                 {r}
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Instructions */}
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Instructions</label>
                      <textarea 
                        value={photoshootForm.instructions}
                        onChange={e => setPhotoshootForm(prev => ({...prev, instructions: e.target.value}))}
                        className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                        placeholder="Describe the desired outcome, lighting, environment..."
                      />
                   </div>

                   {/* Email */}
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Your Email</label>
                      <input 
                        type="email" 
                        value={userEmail}
                        readOnly
                        className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-zinc-500 cursor-not-allowed"
                      />
                   </div>

                   <Button 
                      onClick={handlePhotoshootSubmit} 
                      disabled={isProcessingPhotoshoot}
                      isLoading={isProcessingPhotoshoot}
                      size="lg" 
                      className="w-full"
                      icon={<Camera size={20} />}
                   >
                      Start Photoshoot
                   </Button>

                </div>
             </div>
           )}

           {/* --- ASSETS VIEW --- */}
           {view === 'assets' && (
              <div className="animate-fade-in">
                <WorkflowStepper currentView="assets" onViewChange={setView} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Products Section */}
                  <AssetSection 
                    title="Products" 
                    icon={<Box size={20} />}
                    type="product"
                    assets={assets.filter(a => a.type === 'product')}
                    onAdd={(a) => setAssets(prev => [...prev, a])}
                    onRemove={(id) => setAssets(prev => prev.filter(a => a.id !== id))}
                    validateApiKey={validateApiKey}
                    onApiError={handleApiError}
                  />

                  {/* Logos Section */}
                  <AssetSection 
                    title="Logos & Graphics" 
                    icon={<Layers size={20} />}
                    type="logo"
                    assets={assets.filter(a => a.type === 'logo')}
                    onAdd={(a) => setAssets(prev => [...prev, a])}
                    onRemove={(id) => setAssets(prev => prev.filter(a => a.id !== id))}
                    validateApiKey={validateApiKey}
                    onApiError={handleApiError}
                  />
                </div>

                <div className="mt-8 flex justify-end">
                   <Button onClick={() => setView('studio')} disabled={assets.length < 2} icon={<ArrowRight size={16} />}>
                      Continue to Studio
                   </Button>
                </div>
              </div>
           )}

           {/* --- STUDIO VIEW --- */}
           {view === 'studio' && (
             <div className="animate-fade-in h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
                {/* Left Controls (Bottom on Mobile) */}
                <div className="w-full lg:w-80 flex flex-col gap-6 glass-panel p-6 rounded-2xl overflow-y-auto flex-1 lg:flex-none">
                   <div>
                      <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-4">1. Select Product</h3>
                      <div className="grid grid-cols-3 gap-2">
                         {assets.filter(a => a.type === 'product').map(a => (
                            <div 
                               key={a.id} 
                               onClick={() => setSelectedProductId(selectedProductId === a.id ? null : a.id)}
                               className={`aspect-square rounded-lg border-2 cursor-pointer p-1 transition-all ${selectedProductId === a.id ? 'border-brand-500 bg-brand-500/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-100 dark:bg-zinc-900'}`}
                            >
                               <img src={a.data} className="w-full h-full object-contain" alt={a.name} />
                            </div>
                         ))}
                         {assets.filter(a => a.type === 'product').length === 0 && <p className="text-xs text-zinc-400 col-span-3">No products uploaded</p>}
                      </div>
                   </div>

                   <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">2. Add Logos</h3>
                        {placedLogos.length > 0 && (
                            <span className="text-xs text-brand-600 dark:text-brand-400">{placedLogos.length} on canvas</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Click to add. Drag on canvas to move. Scroll to resize.</p>
                      <div className="grid grid-cols-3 gap-2">
                         {assets.filter(a => a.type === 'logo').map(a => (
                            <div 
                               key={a.id} 
                               onClick={() => addLogoToCanvas(a.id)}
                               className={`relative aspect-square rounded-lg border-2 cursor-pointer p-1 transition-all border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-100 dark:bg-zinc-900`}
                            >
                               <img src={a.data} className="w-full h-full object-contain" alt={a.name} />
                               {/* Count badge */}
                               {placedLogos.filter(l => l.assetId === a.id).length > 0 && (
                                   <div className="absolute -top-2 -right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black border border-white dark:border-zinc-900">
                                       {placedLogos.filter(l => l.assetId === a.id).length}
                                   </div>
                               )}
                            </div>
                         ))}
                         {assets.filter(a => a.type === 'logo').length === 0 && <p className="text-xs text-zinc-400 col-span-3">No logos uploaded</p>}
                      </div>
                   </div>

                   <div>
                      <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-4">3. Instructions</h3>
                      <textarea 
                         className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-base text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none h-24"
                         placeholder="E.g. Embed the logos into the fabric texture..."
                         value={prompt}
                         onChange={(e) => setPrompt(e.target.value)}
                      />
                   </div>

                   <Button 
                      onClick={handleGenerate} 
                      isLoading={loading.isGenerating} 
                      disabled={!selectedProductId || placedLogos.length === 0} 
                      size="lg" 
                      className="mt-auto"
                      icon={<Wand2 size={18} />}
                   >
                      Generate Mockup
                   </Button>
                </div>

                {/* Right Preview - Canvas (Top on Mobile) */}
                <div className="h-[45vh] lg:h-auto lg:flex-1 glass-panel rounded-2xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden select-none flex-shrink-0">
                   {loading.isGenerating && (
                      <div className="absolute inset-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                         <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                         <p className="text-brand-600 dark:text-brand-400 font-mono animate-pulse">{loading.message}</p>
                      </div>
                   )}
                   
                   {selectedProductId ? (
                      <div 
                         ref={canvasRef}
                         className="relative w-full h-full max-h-[600px] p-4"
                      >
                         {/* Product Base */}
                         <img 
                            src={assets.find(a => a.id === selectedProductId)?.data} 
                            className="w-full h-full object-contain drop-shadow-2xl pointer-events-none select-none" 
                            alt="Preview" 
                            draggable={false}
                         />

                         {/* Overlay Layers */}
                         {placedLogos.map((layer) => {
                            const logoAsset = assets.find(a => a.id === layer.assetId);
                            if (!logoAsset) return null;
                            const isDraggingThis = draggedItem?.uid === layer.uid;

                            return (
                               <div
                                  key={layer.uid}
                                  className={`absolute cursor-move group ${isDraggingThis ? 'z-50 opacity-80' : 'z-10'}`}
                                  style={{
                                     left: `${layer.x}%`,
                                     top: `${layer.y}%`,
                                     transform: `translate(-50%, -50%) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                                     // We use a fixed width for the container relative to viewport/container would be better but simplified here
                                     width: '15%', // Base width relative to container
                                     aspectRatio: '1/1'
                                  }}
                                  onMouseDown={(e) => handleMouseDown(e, layer)}
                                  onTouchStart={(e) => handleTouchStart(e, layer)}
                                  onWheel={(e) => handleWheel(e, layer.uid)}
                               >
                                  {/* Selection Border */}
                                  <div className="absolute -inset-2 border-2 border-brand-500/0 group-hover:border-brand-500/50 rounded-lg transition-all pointer-events-none"></div>
                                  
                                  {/* Remove Button */}
                                  <button 
                                    onClick={(e) => removeLogoFromCanvas(layer.uid, e)}
                                    onTouchEnd={(e) => removeLogoFromCanvas(layer.uid, e)}
                                    className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg z-50"
                                    title="Remove"
                                  >
                                    <X size={12} />
                                  </button>

                                  <img 
                                     src={logoAsset.data} 
                                     className="w-full h-full object-contain drop-shadow-lg pointer-events-none"
                                     draggable={false}
                                     alt="layer"
                                  />
                               </div>
                            );
                         })}
                      </div>
                   ) : (
                      <div className="text-center text-zinc-400 dark:text-zinc-600">
                         <Shirt size={64} className="mx-auto mb-4 opacity-20" />
                         <p>Select a product to start designing</p>
                      </div>
                   )}
                </div>
             </div>
           )}

           {/* --- GALLERY VIEW --- */}
           {view === 'gallery' && (
              <div className="animate-fade-in">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Generated Mockups</h2>
                    <Button variant="outline" onClick={() => setView('studio')} icon={<Plus size={16}/>}>New Mockup</Button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedMockups.map(mockup => (
                       <div key={mockup.id} className="group glass-panel rounded-xl overflow-hidden shadow-sm">
                          <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
                             <img src={mockup.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Mockup" />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  icon={<Maximize size={16}/>}
                                  onClick={() => setSelectedMockup(mockup)}
                                >
                                  View
                                </Button>
                                <a href={mockup.imageUrl} download={`mockup-${mockup.id}.png`}>
                                  <Button size="sm" variant="primary" icon={<Download size={16}/>}>Save</Button>
                                </a>
                             </div>
                          </div>
                          <div className="p-4">
                             <p className="text-xs text-zinc-500 mb-1">{new Date(mockup.createdAt).toLocaleDateString()}</p>
                             <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">{mockup.prompt || "Auto-generated mockup"}</p>
                             {mockup.layers && mockup.layers.length > 0 && (
                                 <div className="mt-2 flex gap-1">
                                     <span className="text-xs px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400">{mockup.layers.length} logos</span>
                                 </div>
                             )}
                          </div>
                       </div>
                    ))}
                    {generatedMockups.length === 0 && (
                       <div className="col-span-full py-20 text-center glass-panel rounded-xl">
                          <ImageIcon size={48} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-300">No mockups yet</h3>
                          <p className="text-zinc-500 dark:text-zinc-500 mb-6">Create your first design in the Studio</p>
                          <Button onClick={() => setView('studio')}>Go to Studio</Button>
                       </div>
                    )}
                 </div>
              </div>
           )}
        </div>
      </main>
    </div>
  );
}