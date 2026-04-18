import { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { playSound } from '../audio';
import * as XLSX from 'xlsx';
import { toPng } from 'html-to-image';

export default function EmailResultScreen() {
  const { activityName, prizes, winners, resetLottery } = useAppStore();
  const resultRef = useRef<HTMLDivElement>(null);

  const exportEmailsToExcel = () => {
    playSound('click');
    const data: any[] = [];
    prizes.forEach(prize => {
      const prizeWinners = winners[prize.id] || [];
      prizeWinners.forEach(w => {
        data.push({
          '獎項名稱': prize.name,
          '獎品內容': prize.item,
          '姓名': w.name,
          '部門': w.dept,
          '單位': w.unit,
          'Email': `NT${w.rowId}@cathaybk.com.tw`,
          '主旨': `🎉 恭喜您中獎！「${activityName}活動」得獎通知`,
          '信件內容': `您好，\n\n恭喜您於「${activityName}活動」中幸運獲得 ${prize.name} 獎項！\n您的獎品是：${prize.item} 🎁\n\n請您留意後續領獎相關事宜，\n如需了解相關詳情，請直接回覆本信件與我們聯繫。\n感謝您的參與，再次恭喜您中獎！`
        });
      });
    });
    
    if (data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "信件範例");
    XLSX.writeFile(wb, `【${activityName}】中獎信件範本.xlsx`);
  };

  const exportImage = () => {
    playSound('click');
    if (resultRef.current) {
      toPng(resultRef.current, { 
        backgroundColor: '#ffffff', 
        width: resultRef.current.scrollWidth + 64,
        height: resultRef.current.scrollHeight + 64,
        style: { padding: '2rem', margin: '0' },
        pixelRatio: 2
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `【${activityName}】中獎總名單.png`;
          link.href = dataUrl;
          link.click();
        });
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div ref={resultRef}>
        <h2 style={{ color: 'var(--tree-green)', textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          【{activityName}】中獎總名單
        </h2>

        {/* WINNER LIST OVERVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
        {prizes.map((prize) => {
          const prizeWinners = winners[prize.id] || [];
          if (prizeWinners.length === 0) return null;

          return (
             <div key={prize.id} style={{ border: '4px solid var(--border-color)', backgroundColor: '#fff' }}>
                <div style={{ backgroundColor: 'var(--tree-green-light)', padding: '1rem', fontWeight: 'bold', borderBottom: '4px solid var(--border-color)' }}>
                  【{prize.name}】 {prize.item} - 共 {prizeWinners.length} 名
                </div>
                <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                  {prizeWinners.map(w => (
                    <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', backgroundColor: 'var(--bg-color)', border: '2px solid var(--border-color)', padding: '0.5rem' }}>
                      <img src="/duck_icon.png" alt="duck" className="pixelated" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 'bold' }}>{w.name}</div>
                        <div style={{ fontSize: '0.7rem' }}>{w.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          );
        })}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
        <button className="btn btn-outline" onClick={() => { playSound('drop'); resetLottery(); }}>
          重新辦一場抽獎
        </button>
        <button className="btn btn-primary" onClick={exportImage}>
          保存中獎圖片
        </button>
        <button className="btn btn-secondary" onClick={exportEmailsToExcel}>
          下載信件範本 Excel
        </button>
      </div>
    </div>
  );
}
