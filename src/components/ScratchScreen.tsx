import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { playSound } from '../audio';

export default function ScratchScreen() {
  const { prizes, currentPrizeIndex, setCurrentPrizeIndex, pendingWinners, setStep, addWinner } = useAppStore();
  const prize = prizes[currentPrizeIndex];
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isScratched || !canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Retro silver coating
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#A0A0A0';
    for (let i = 0; i < 200; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 4, 4);
    }
    
    ctx.font = 'bold 24px "DotGothic16", monospace';
    ctx.fillStyle = '#444';
    ctx.textAlign = 'center';
    ctx.fillText('用滑鼠刮除 或 點擊『電腦幫我刮』', canvas.width / 2, canvas.height / 2);
  }, [isScratched, pendingWinners]);

  const checkScratchedArea = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 64) {
      if (pixels[i] === 0) transparentPixels++;
    }

    const totalSamples = pixels.length / 64;
    if (transparentPixels / totalSamples > 0.4) { 
      handleAutoScratch();
    }
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    // Use square scratch for pixel aesthetic, much larger chunk for easier scratching
    ctx.fillRect(x - 50, y - 50, 100, 100);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isScratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    scratch(e.clientX - rect.left, e.clientY - rect.top);
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isScratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    scratch(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleAutoScratch = () => {
    if (isScratched) return;
    
    playSound('success');
    
    // Play real duck sound
    const duckSound = new Audio('/duck.mp3');
    duckSound.play().catch(() => console.log('Duck sound failed'));
    
    setIsScratched(true);
    
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#FCC539', '#F8AB92', '#7BCABE'],
      disableForReducedMotion: true,
      shapes: ['square'] // pixel confetti
    });

    pendingWinners.forEach(p => addWinner(prize.id, p));
  };

  const handleNext = () => {
    playSound('click');
    if (currentPrizeIndex + 1 < prizes.length) {
      setCurrentPrizeIndex(currentPrizeIndex + 1);
      setStep('shuffle'); 
    } else {
      setStep('result'); 
    }
  };

  if (!prize) return null;

  // Render appearing ducks animation
  const appearingDucks = Array.from({ length: 3 }).map((_, i) => {
    const leftPositions = ['20%', '50%', '80%'];
    return (
      <motion.img
        key={`duck-${i}`}
        src="/duck_pixel.png"
        className="pixelated"
        initial={{ scale: 0, y: 100, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1.5, 0], y: [100, 0, 0, 100], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2, times: [0, 0.1, 0.85, 1], delay: i * 0.3 }}
        style={{ 
          position: 'absolute', 
          bottom: '0px', 
          left: leftPositions[i % leftPositions.length], 
          transform: 'translateX(-50%)',
          width: '80px', 
          height: '80px', 
          zIndex: 0, 
          pointerEvents: 'none',
          objectFit: 'contain'
        }}
      />
    );
  });

  return (
    <div className="card text-center" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2 style={{ color: 'var(--tree-green)', margin: '1rem 0' }}>開獎啦：【{prize.name}】 {prize.item}</h2>
      
      {isScratched && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          style={{ marginBottom: '1rem', zIndex: 10 }}
        >
           <h1 style={{ margin: 0, color: 'var(--warm-orange)', textShadow: '4px 4px 0 black, -2px -2px 0 black, 2px -2px 0 black, -2px 2px 0 black', fontSize: '3.5rem' }}>恭喜中獎！</h1>
        </motion.div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        {!isScratched && (
          <button className="btn btn-secondary" onClick={handleAutoScratch}>
            電腦幫我刮
          </button>
        )}
      </div>

        <div 
        ref={containerRef}
        style={{ 
          position: 'relative', 
          minHeight: '350px', 
          backgroundColor: 'var(--bg-color)',
          border: '4px solid var(--border-color)',
          padding: '2rem',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{
          display: 'grid', 
          gridTemplateColumns: `repeat(${Math.min(pendingWinners.length, 3)}, 200px)`,
          gap: '1.5rem',
          opacity: 1
        }}>
          {pendingWinners.map((p, i) => (
            <div key={p.id} style={{
              width: '200px',
              backgroundColor: 'white',
              padding: '1rem',
              border: '4px solid var(--duck-yellow)',
              boxShadow: '4px 4px 0 rgba(0,0,0,1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <img src="/duck_icon.png" alt="duck" className="pixelated" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              <div style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>{p.name}</div>
              <div style={{ fontSize: '1rem', color: 'var(--text-light)' }}>{p.unit}</div>
            </div>
          ))}
        </div>

        {isScratched && (
          <AnimatePresence>
            {appearingDucks}
          </AnimatePresence>
        )}

        {!isScratched && (
          <canvas
            ref={canvasRef}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              cursor: 'crosshair',
            }}
            onMouseDown={(e) => { setIsDrawing(true); handleMouseMove(e); }}
            onMouseMove={handleMouseMove}
            onMouseUp={() => { setIsDrawing(false); checkScratchedArea(); }}
            onMouseLeave={() => { setIsDrawing(false); checkScratchedArea(); }}
            onTouchStart={(e) => { setIsDrawing(true); handleTouchMove(e); }}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => { setIsDrawing(false); checkScratchedArea(); }}
          />
        )}
      </div>

      {isScratched && (
        <div style={{ marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={handleNext}>
            {currentPrizeIndex + 1 < prizes.length ? '► 繼續抽下一個獎' : '► 抽獎結束，查看全部名單'}
          </button>
        </div>
      )}
    </div>
  );
}
