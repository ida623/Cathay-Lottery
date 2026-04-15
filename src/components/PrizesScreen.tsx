import { useAppStore, type Prize } from '../store';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2, Gift } from 'lucide-react';
import { playSound } from '../audio';

export default function PrizesScreen() {
  const { prizes, setPrizes, setStep, filteredParticipants } = useAppStore();

  const handleAddPrize = () => {
    const newPrize: Prize = {
      id: Math.random().toString(36).substring(7),
      name: `獎項 ${prizes.length + 1}`,
      item: '神秘禮物',
      count: 1,
    };
    setPrizes([...prizes, newPrize]);
  };

  const handleRemovePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
  };

  const handleChangePrize = (id: string, field: keyof Prize, value: string | number) => {
    setPrizes(prizes.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(prizes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPrizes(items);
  };

  const totalPrizeCount = prizes.reduce((acc, p) => acc + Number(p.count), 0);
  const maxPossible = filteredParticipants.length;

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--tree-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Gift /> 設定抽獎獎項
        </h2>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
          目前符合抽獎資格人數：<strong>{maxPossible}</strong> 人
        </span>
      </div>

      <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
          請設定要抽出的獎項，支援拖拉排序（建議由小獎排到大獎，系統會依序此順序進行抽獎）。
        </p>
        
        {prizes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
            目前還沒有任何獎項，趕快新增吧！
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="prizesList">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-2">
                  {prizes.map((prize, index) => (
                    <Draggable key={prize.id} draggableId={prize.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            backgroundColor: 'white',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <div {...provided.dragHandleProps} style={{ color: 'var(--text-light)', cursor: 'grab' }}>
                            <GripVertical size={20} />
                          </div>
                          
                          <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.2rem' }}>獎項名稱</label>
                              <input 
                                className="input" 
                                value={prize.name} 
                                onChange={e => handleChangePrize(prize.id, 'name', e.target.value)} 
                                style={{ padding: '0.5rem', height: '42px', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div style={{ flex: 2 }}>
                              <label style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.2rem' }}>獎品內容</label>
                              <input 
                                className="input" 
                                value={prize.item} 
                                onChange={e => handleChangePrize(prize.id, 'item', e.target.value)} 
                                style={{ padding: '0.5rem', height: '42px', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div style={{ width: '100px' }}>
                              <label style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.2rem' }}>抽出人數</label>
                              <input 
                                type="number" 
                                min={1} 
                                className="input" 
                                value={prize.count} 
                                onChange={e => {
                                  const val = e.target.value;
                                  handleChangePrize(prize.id, 'count', val === '' ? '' : parseInt(val) || 1);
                                }} 
                                style={{ padding: '0.5rem', height: '42px', boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>
                          
                          <button 
                            className="btn" 
                            style={{ padding: '0', backgroundColor: '#fee2e2', color: '#ef4444', alignSelf: 'flex-end', height: '42px', width: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => handleRemovePrize(prize.id)}
                            title="刪除"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
        
        <button className="btn btn-outline mt-4" style={{ width: '100%' }} onClick={handleAddPrize}>
          <Plus size={18} /> 新增獎項
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
        <button className="btn btn-outline" onClick={() => setStep('participants')}>上一步</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: totalPrizeCount > maxPossible ? 'red' : 'inherit' }}>
            預計抽出: <strong>{totalPrizeCount}</strong> 人
          </span>
          <button 
            className="btn btn-primary" 
            disabled={prizes.length === 0 || totalPrizeCount === 0 || totalPrizeCount > maxPossible}
            onClick={() => { playSound('click'); setStep('shuffle'); }} // Change to shuffle step
          >
            準備洗牌，開始抽獎！
          </button>
        </div>
      </div>
    </div>
  );
}
