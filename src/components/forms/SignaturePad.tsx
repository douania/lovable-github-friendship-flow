import React, { useRef, useState, useEffect } from 'react';
import { Pen, Trash2 } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  initialSignature?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange, initialSignature }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (initialSignature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();

    const point = 'touches' in e ? e.touches[0] : e;
    ctx.moveTo(
      point.clientX - rect.left,
      point.clientY - rect.top
    );
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = 'touches' in e ? e.touches[0] : e;
    ctx.lineTo(
      point.clientX - rect.left,
      point.clientY - rect.top
    );
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const signature = canvas.toDataURL('image/png');
      onSignatureChange(signature);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Signature du patient
        </label>
        {hasSignature && (
          <button
            type="button"
            onClick={clearSignature}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Effacer
          </button>
        )}
      </div>

      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair touch-none"
          style={{ maxHeight: '200px' }}
        />
        
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <Pen className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Signez ici</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;
