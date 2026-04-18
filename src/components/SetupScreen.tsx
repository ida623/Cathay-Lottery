import React, { useState } from 'react';
import { useAppStore } from '../store';
import { playSound } from '../audio';

export default function SetupScreen() {
  const { activityName, setActivityName, setStep, resetLottery } = useAppStore();
  const [name, setName] = useState(activityName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      playSound('click');
      resetLottery();
      setActivityName(name.trim());
      setStep('participants');
    }
  };

  return (
    <div className="card text-center" style={{ maxWidth: '600px', margin: '4rem auto', padding: '3rem' }}>
      <img
        src="/duck_icon.png"
        alt="Ducky"
        className="pixelated"
        style={{ width: '120px', height: '120px', margin: '0 auto 1rem', display: 'block', objectFit: 'contain' }}
      />
      <h2 style={{ marginBottom: '2rem', color: 'var(--tree-green)', fontSize: '2rem', textShadow: '2px 2px 0px var(--border-color)' }}>
        今天呱了嗎？
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="activityName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            ▶ 請輸入活動名稱：
          </label>
          <input
            id="activityName"
            type="text"
            className="input"
            placeholder="例如：2026年5月午餐會"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary mt-4"
          disabled={!name.trim()}
        >
          START GAME
        </button>
      </form>
    </div>
  );
}
