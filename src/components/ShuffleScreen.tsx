import { useEffect } from 'react';
import { useAppStore } from '../store';
import { motion } from 'framer-motion';

export default function ShuffleScreen() {
  const { setStep, currentPrizeIndex, prizes, filteredParticipants } = useAppStore();
  const currentPrize = prizes[currentPrizeIndex];

  // Auto transition to select-card after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('select-card');
    }, 4000); // 4 seconds animation
    return () => clearTimeout(timer);
  }, [setStep]);

  if (!currentPrize) return null;

  // We only show a limited number of cards for the visual effect if > 50
  const visualCardsCount = Math.min(filteredParticipants.length, 50);
  const visualCards = Array.from({ length: visualCardsCount }).map((_, i) => i);

  return (
    <div className="card text-center" style={{ maxWidth: '800px', margin: '2rem auto', height: '500px', position: 'relative', overflow: 'hidden' }}>
      <h2 style={{ color: 'var(--tree-green)', margin: '1rem 0' }}>
        即將抽出：【{currentPrize.name}】 {currentPrize.item} (共 {currentPrize.count} 名)
      </h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>正在洗牌中，請稍候...</p>

      <div style={{ position: 'relative', width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {visualCards.map((id, index) => (
          <motion.div
            key={id}
            initial={{ 
              x: 0, 
              y: 0, 
              rotate: 0, 
              opacity: 0 
            }}
            animate={{ 
              x: (Math.random() - 0.5) * 300, 
              y: (Math.random() - 0.5) * 200, 
              rotate: (Math.random() - 0.5) * 60,
              opacity: 1
            }}
            transition={{ 
              duration: 2, 
              ease: "circOut", 
              delay: index * 0.02,
              repeat: 1,
              repeatType: 'reverse'
            }}
            style={{
              position: 'absolute',
              width: '80px',
              height: '110px',
              backgroundColor: 'var(--tree-green-light)',
              borderRadius: '0.5rem',
              border: '2px solid white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <div style={{ fontSize: '2rem' }}><img src="/duck_pixel.png" className="pixelated" style={{ width: '48px', height: '48px', objectFit: 'contain' }} /></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
