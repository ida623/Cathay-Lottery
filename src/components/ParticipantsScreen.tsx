import React, { useState, useMemo } from 'react';
import { useAppStore, type Participant } from '../store';
import * as XLSX from 'xlsx';
import { playSound } from '../audio';

export default function ParticipantsScreen() {
  const { setParticipants, setFilteredParticipants, setStep, participants } = useAppStore();

  const [activeTab, setActiveTab] = useState<'text' | 'excel'>('excel');
  const [textInput, setTextInput] = useState('');
  
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  // Parse Text
  const handleParseText = () => {
    try {
      const lines = textInput.split('\n').filter(line => line.trim() !== '');
      const dataLines = lines[0].includes('行編') ? lines.slice(1) : lines;
      
      const parsed: Participant[] = [];
      dataLines.forEach((line) => {
        const cols = line.split(/[\t]+/).map(c => c.trim());
        if (cols.length >= 6) {
          parsed.push({
            id: Math.random().toString(36).substring(7),
            rowId: cols[0] || '',
            empId: cols[1] || '',
            name: cols[2] || '',
            dept: cols[4] || '',
            unit: cols[5] || '',
            isWinner: false,
          });
        }
      });
      if (parsed.length > 0) {
        setParticipants(parsed);
        setFilteredParticipants(parsed);
        setSelectedUnits(Array.from(new Set(parsed.map(p => p.unit).filter(Boolean))));
      } else {
        playSound('error');
        alert('無法解析名單，請確認格式');
      }
    } catch (e) {
      playSound('error');
      alert('解析失敗！');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json<any>(ws);

      const parsed: Participant[] = [];
      data.forEach((row) => {
        const rowId = row['行編'] || Object.values(row)[0] || '';
        const empId = row['集團員編'] || Object.values(row)[1] || '';
        const name = row['姓名'] || Object.values(row)[2] || '';
        const dept = row['部門'] || Object.values(row)[4] || '';
        const unit = row['單位'] || Object.values(row)[5] || '';
        
        parsed.push({
          id: Math.random().toString(36).substring(7),
          rowId: String(rowId),
          empId: String(empId),
          name: String(name),
          dept: String(dept),
          unit: String(unit),
          isWinner: false,
        });
      });
      
      setParticipants(parsed);
      setFilteredParticipants(parsed);
      setSelectedUnits(Array.from(new Set(parsed.map(p => p.unit).filter(Boolean))));
    };
    reader.readAsBinaryString(file);
  };

  const allUnits = useMemo(() => Array.from(new Set(participants.map(p => p.unit).filter(Boolean))), [participants]);

  const handleApplyFilter = () => {
    playSound('click');
    let filtered = [...participants];
    if (selectedUnits.length > 0) {
      filtered = filtered.filter(p => selectedUnits.includes(p.unit));
    }
    setFilteredParticipants(filtered);
    setStep('prizes');
  };

  const toggleUnit = (unit: string) => {
    setSelectedUnits(prev => prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]);
  };

  // 全選功能

  const selectAllUnits = () => {
    if (selectedUnits.length === allUnits.length) {
      setSelectedUnits([]); // 取消全選
    } else {
      setSelectedUnits(allUnits);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2 style={{ color: 'var(--tree-green)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
        ▶ 匯入抽籤名單
      </h2>

      {participants.length === 0 ? (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button className={`btn ${activeTab === 'excel' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('excel'); }}>Excel 檔案</button>
            <button className={`btn ${activeTab === 'text' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('text'); }}>文字貼上</button>
          </div>

          {activeTab === 'text' && (
            <div className="flex flex-col gap-4">
              <textarea 
                className="input" 
                rows={10} 
                placeholder="貼上資料 (行編 集團員編 姓名...)"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleParseText}>確認送出</button>
            </div>
          )}

          {activeTab === 'excel' && (
            <div style={{ padding: '3rem 2rem', border: '4px dashed var(--border-color)', backgroundColor: 'var(--bg-color)', textAlign: 'center' }}>
              <p style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>將部門名單 (.xlsx) 匯入遊戲</p>
              <label className="btn btn-secondary">
                選擇檔案
                <input type="file" accept=".xlsx, .xls" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '2rem' }}>
            <button className="btn btn-outline" onClick={() => { setStep('setup'); }}>上一步</button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--duck-yellow-lighter)', padding: '1rem', border: '4px solid var(--border-color)' }}>
            <span style={{ fontWeight: 'bold' }}>◆ 總人數：{selectedUnits.length > 0 ? participants.filter(p => selectedUnits.includes(p.unit)).length : participants.length} 人</span>
            <button className="btn" style={{ fontSize: '0.9rem', padding: '0.5rem' }} onClick={() => { setParticipants([]); }}>
              重新匯入
            </button>
          </div>

          <div style={{ border: '4px solid var(--border-color)', padding: '1.5rem', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '4px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>選擇單位</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedUnits.length === allUnits.length} onChange={selectAllUnits} style={{ accentColor: 'var(--tree-green)', transform: 'scale(1.2)' }} />
                全選
              </label>
            </div>

            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {allUnits.map(u => {
                  const count = participants.filter(p => p.unit === u).length;
                  return (
                  <label key={u} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: selectedUnits.includes(u) ? 'var(--duck-yellow-light)' : '#eee', padding: '0.5rem 1rem', border: '2px solid var(--border-color)', borderRadius: '20px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selectedUnits.includes(u)} onChange={() => toggleUnit(u)} style={{ accentColor: 'var(--duck-yellow)' }}/> {u} ({count})
                  </label>
                )})}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
            <button className="btn btn-outline" onClick={() => { setStep('setup'); }}>上一步</button>
            <button className="btn btn-primary" onClick={handleApplyFilter}>
              設定完成，前往獎項
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
