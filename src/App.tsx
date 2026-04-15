import { useAppStore } from './store';
import SetupScreen from './components/SetupScreen';
import ParticipantsScreen from './components/ParticipantsScreen';
import PrizesScreen from './components/PrizesScreen';
import ShuffleScreen from './components/ShuffleScreen';
import SelectCardScreen from './components/SelectCardScreen';
import ScratchScreen from './components/ScratchScreen';
import EmailResultScreen from './components/EmailResultScreen';

function App() {
  const step = useAppStore((state) => state.step);

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {step !== 'setup' && (
        <header className="flex items-center justify-center gap-4 text-center mt-4 mb-4" style={{ padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--duck-yellow)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/duck_icon.png" alt="Duck Logo" style={{ width: '32px', height: '32px' }} />
          </div>
          <h1 style={{ color: 'var(--tree-green)', textShadow: '2px 2px 0px var(--border-color)' }}>今天呱了嗎？</h1>
        </header>
      )}
      
      <main style={{ flex: 1 }}>
        {step === 'setup' && <SetupScreen />}
        {step === 'participants' && <ParticipantsScreen />}
        {step === 'prizes' && <PrizesScreen />}
        {step === 'shuffle' && <ShuffleScreen />}
        {step === 'select-card' && <SelectCardScreen />}
        {step === 'scratch' && <ScratchScreen />}
        {step === 'result' && <EmailResultScreen />}
      </main>
      
      <footer className="text-center mt-8 mb-4" style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
        <p>© 2026 今天呱了嗎？抽獎系統</p>
      </footer>
    </div>
  );
}

export default App;
