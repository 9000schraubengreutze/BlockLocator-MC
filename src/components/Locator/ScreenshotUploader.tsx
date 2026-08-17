import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, ZoomIn, Sparkles, AlertCircle } from 'lucide-react';
import { DEMO_PRESETS } from '../../data/demoPresets';

interface ScreenshotUploaderProps {
  screenshot: string | null;
  fileName?: string;
  fileSize?: number;
  onScreenshotChange: (base64: string | null, name?: string, size?: number) => void;
  onSelectPreset?: (presetId: string) => void;
}

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  screenshot,
  fileName,
  fileSize,
  onScreenshotChange,
  onSelectPreset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Global paste handler so users can paste screenshots directly from clipboard (F2, Win+Shift+S, etc.)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          processFile(file);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      setErrorMsg('Unsupported format. Please upload a PNG, JPG, or WEBP Minecraft screenshot.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File too large. Maximum size is 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onScreenshotChange(base64, file.name, file.size);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          Minecraft Screenshot
          <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Required
          </span>
        </label>
        {screenshot && (
          <button
            type="button"
            onClick={() => onScreenshotChange(null)}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Remove Screenshot
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {!screenshot ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group rounded-2xl border-2 border-dashed transition-all cursor-pointer p-8 text-center flex flex-col items-center justify-center min-h-[220px] ${
            isDragging
              ? 'border-emerald-400 bg-emerald-950/30 scale-[1.01]'
              : 'border-slate-700/80 hover:border-emerald-500/60 bg-slate-900/50 hover:bg-slate-900/80'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shadow-lg shadow-emerald-950/40">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-base font-bold text-slate-100 mb-1">
            Drop your Minecraft screenshot here
          </p>
          <p className="text-xs text-slate-400 mb-4">
            PNG, JPG or WEBP <span className="text-slate-500">•</span> Paste from clipboard with <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono text-[10px]">Ctrl+V</kbd>
          </p>

          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors shadow-md flex items-center gap-2"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            Select File from Device
          </button>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950/90 shadow-xl group">
          <div className="relative w-full h-[240px] sm:h-[280px] bg-black/60 flex items-center justify-center overflow-hidden">
            <img
              src={screenshot}
              alt="Minecraft Screenshot Preview"
              className={`w-full h-full object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />

            {/* Top Preview Info Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-mono text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="truncate max-w-[180px] sm:max-w-[260px]">{fileName || 'screenshot.png'}</span>
                {fileSize ? <span className="text-slate-400">({formatBytes(fileSize)})</span> : null}
              </div>

              <div className="flex items-center gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition-colors"
                  title="Toggle Zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[11px] font-medium text-slate-200 border border-slate-600 backdrop-blur-md transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onScreenshotChange(null)}
                  className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 backdrop-blur-md transition-colors"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Horizon/Scan Overlay */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-emerald-400/90 bg-black/75 px-3 py-1 rounded-lg border border-emerald-500/20 backdrop-blur-sm pointer-events-none">
              <span>SCAN TARGET READY</span>
              <span>FOV: ~70° • 16:9 RECTILINEAR</span>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Example Screenshots */}
      {!screenshot && onSelectPreset && (
        <div className="pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Or test with a sample screenshot:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className="group p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 text-left transition-all cursor-pointer"
              >
                <div className="h-14 rounded-lg overflow-hidden mb-1.5 bg-slate-950 border border-slate-800 relative">
                  <img
                    src={preset.imageThumbnail}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[9px] font-mono text-emerald-300">
                    {preset.edition}
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-slate-200 truncate group-hover:text-emerald-300">
                  {preset.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Seed: {preset.seed || 'None'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
