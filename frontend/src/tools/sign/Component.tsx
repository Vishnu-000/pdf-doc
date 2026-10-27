import React, { useRef, useState, useEffect } from 'react';
import { SignOptions } from './logic';
import { Pen, Type, Upload, RotateCcw, Check } from 'lucide-react';

interface SignProps {
  options: SignOptions;
  setOptions: React.Dispatch<React.SetStateAction<SignOptions>>;
  disabled?: boolean;
}

export const SignComponent: React.FC<SignProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (tab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [tab]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || !canvasRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !canvasRef.current) return;
    setIsDrawing(false);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setOptions((prev) => ({ ...prev, signatureDataUrl: dataUrl }));
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setOptions((prev) => ({ ...prev, signatureDataUrl: undefined }));
    }
  };

  // Render typed signature onto hidden canvas
  const handleTypeChange = (name: string) => {
    setTypedName(name);
    if (!name.trim()) {
      setOptions((prev) => ({ ...prev, signatureDataUrl: undefined }));
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = 'italic 48px "Brush Script MT", "Caveat", "Dancing Script", cursive, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, 200, 60);
      const dataUrl = canvas.toDataURL('image/png');
      setOptions((prev) => ({ ...prev, signatureDataUrl: dataUrl }));
    }
  };

  // Upload signature image
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setOptions((prev) => ({ ...prev, signatureDataUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Create Signature
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setTab('draw')}
            className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'draw'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pen size={13} /> Draw
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setTab('type')}
            className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'type'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type size={13} /> Type
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setTab('upload')}
            className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'upload'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload size={13} /> Upload
          </button>
        </div>
      </div>

      {/* DRAW TAB */}
      {tab === 'draw' && (
        <div className="space-y-2">
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              width={340}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[140px] cursor-crosshair touch-none"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={clearCanvas}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded font-medium flex items-center gap-1 shadow-xs"
              >
                <RotateCcw size={12} /> Clear
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Sign with your mouse, trackpad, or touch screen.
          </p>
        </div>
      )}

      {/* TYPE TAB */}
      {tab === 'type' && (
        <div className="space-y-2">
          <input
            type="text"
            value={typedName}
            onChange={(e) => handleTypeChange(e.target.value)}
            placeholder="Type your name..."
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          {typedName && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center">
              <span
                style={{
                  fontFamily: 'cursive, "Brush Script MT", "Caveat"',
                  fontSize: '32px',
                }}
                className="text-slate-900"
              >
                {typedName}
              </span>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD TAB */}
      {tab === 'upload' && (
        <div className="space-y-2">
          <label className="block p-6 border-2 border-dashed border-slate-300 hover:border-brand-400 rounded-xl bg-slate-50 text-center cursor-pointer transition-colors">
            <Upload size={24} className="mx-auto text-slate-400 mb-1" />
            <span className="text-xs font-semibold text-brand-600">Select Signature Image</span>
            <span className="block text-[11px] text-slate-400 mt-0.5">PNG, JPG with transparent background</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleUploadImage}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Page & Placement Settings */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Placement Position
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['bottom-right', 'bottom-left', 'center'] as const).map((pos) => (
              <button
                key={pos}
                type="button"
                disabled={disabled}
                onClick={() => setOptions((prev) => ({ ...prev, position: pos }))}
                className={`py-1.5 px-2 rounded-lg border text-xs font-medium text-center capitalize transition-all ${
                  options.position === pos
                    ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {pos.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Page to Sign
          </label>
          <input
            type="number"
            min={1}
            value={options.pageNumber || 1}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                pageNumber: parseInt(e.target.value, 10) || 1,
              }))
            }
            disabled={disabled}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
