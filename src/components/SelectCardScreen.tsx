import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { playSound } from '../audio';

export default function SelectCardScreen() {
  const { prizes, currentPrizeIndex, filteredParticipants, setPendingWinners, setStep } = useAppStore();
  const prize = prizes[currentPrizeIndex];
  const currentPool = useMemo(() => {
    const pool = filteredParticipants.filter(p => !p.isWinner);
    // 隨機打亂名單，確保手動選卡時真正公平，而不是每次都選到 Excel 的前幾名
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }, [filteredParticipants]);
  
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Create randomized numeric IDs for display on card backs
  const displayIds = useMemo(() => {
    return currentPool.map(() => {
      // 6 digit number
      return Math.floor(100000 + Math.random() * 900000).toString();
    });
  }, [currentPool]);

  if (!prize) return null;

  // 如果剩餘人數少於要抽的獎項數，就以上限為準，並處理 TypeScript 型別 (number | '')
  const prizeCount = Math.min(Number(prize.count) || 1, currentPool.length);
  const enforceAuto = currentPool.length > 100;

  const drawWinners = (count: number) => {
    const pool = [...currentPool];
    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  };

  const handleAutoDraw = () => {
    playSound('click');
    const winners = drawWinners(prizeCount);
    setPendingWinners(winners);
    setStep('scratch');
  };
  
  const handleManualConfirm = () => {
    playSound('click');
    const winners = selectedIndices.map(i => currentPool[i]);
    setPendingWinners(winners);
    setStep('scratch');
  };

  const toggleSelectCard = (index: number) => {
    if (selectedIndices.includes(index)) {
      playSound('drop');
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      if (selectedIndices.length < prizeCount) {
        playSound('click');
        setSelectedIndices([...selectedIndices, index]);
      } else {
        playSound('error');
      }
    }
  };

  const cardsLeft = prizeCount - selectedIndices.length;

  return (
    <div className="card text-center" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2 style={{ color: 'var(--tree-green)', margin: '1rem 0' }}>抽獎環節：【{prize.name}】</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
        預計抽出 {prizeCount} 名幸運兒！
      </p>

      {enforceAuto ? (
        <div style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', border: '4px solid var(--border-color)', marginTop: '2rem' }}>
          <p style={{ color: 'var(--text-dark)', marginBottom: '2rem' }}>目前名單人數超過 100 人，為了最佳體驗，採用電腦隨機選卡模式。</p>
          <button className="btn btn-primary" onClick={handleAutoDraw}>
            電腦幫我選
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 'bold' }}>手動選擇卡片 或 點擊『電腦幫我選』</span>
              {cardsLeft > 0 ? (
                <span style={{ color: 'red', fontWeight: 'bold' }}>(還要再選 {cardsLeft} 張)</span>
              ) : (
                <span style={{ color: 'var(--tree-green)', fontWeight: 'bold' }}>(選擇完成)</span>
              )}
            </div>
            <button className="btn btn-secondary" onClick={handleAutoDraw}>
              電腦幫我選
            </button>
            {cardsLeft === 0 && (
              <button className="btn btn-primary" onClick={handleManualConfirm} style={{ padding: '0.25rem 1.5rem', alignSelf: 'stretch' }}>
                確定刮卡
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '1rem',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '1rem',
            border: '4px solid var(--border-color)',
            backgroundColor: 'var(--bg-color)'
          }}>
            {currentPool.map((p, i) => {
              const isSelected = selectedIndices.includes(i);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleSelectCard(i)}
                  style={{
                    height: '140px',
                    backgroundColor: isSelected ? 'var(--duck-yellow)' : 'var(--tree-green-light)',
                    border: '4px solid var(--border-color)',
                    boxShadow: isSelected ? 'inset 0 0 0 4px #fff' : '4px 4px 0 rgba(0,0,0,1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.05)' : 'translate(-2px, -2px)',
                    transition: 'transform 0.1s',
                    position: 'relative'
                  }}
                >
                  <img
                    src="/duck_pixel.png"
                    alt="duck"
                    className="pixelated"
                    style={{
                      width: '48px',
                      height: '48px',
                      opacity: isSelected ? 1 : 0.7,
                      filter: isSelected ? 'none' : 'grayscale(30%)',
                      objectFit: 'contain'
                    }}
                  />
                  <div style={{ fontSize: '0.8rem', color: isSelected ? '#000' : '#fff', marginTop: '0.5rem', fontWeight: 'bold' }}>
                    {displayIds[i]}
                  </div>
                  {isSelected && (
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: 'var(--warm-orange)', border: '2px solid #000', padding: '0.2rem 0.5rem', color: 'white', fontWeight: 'bold' }} onClick={(e) => { e.stopPropagation(); toggleSelectCard(i); }}>
                      X
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button className="btn btn-outline" onClick={() => { setStep('prizes'); }}>上一步</button>
      </div>
    </div>
  );
}
