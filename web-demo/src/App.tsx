import { useState } from 'react'
import Home from './pages/Home'
import Pathfinding from './pages/Pathfinding'
import DataFlow from './pages/DataFlow'
import DataWarehouse from './pages/DataWarehouse'

export type Page = 'home' | 'pathfinding' | 'dataflow' | 'warehouse'

const NAV: { id: Page; label: string }[] = [
  { id: 'home', label: '首页' },
  { id: 'pathfinding', label: '基础算法' },
  { id: 'dataflow', label: '系统构架' },
  { id: 'warehouse', label: '数据工程' },
]

export default function App() {
  const [page, setPage] = useState<Page>('home')

  return (
    <div style={{ background: '#05091A', minHeight: '100vh' }}>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(5,9,26,0.88)', backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(0,207,255,0.1)',
          height: 56, display: 'flex', alignItems: 'center',
          padding: '0 40px', justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
            fontSize: 20, color: '#00CFFF', letterSpacing: 4,
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#00CFFF',
            boxShadow: '0 0 8px #00CFFF',
            display: 'inline-block',
            animation: 'badge-blink 2s ease-in-out infinite',
          }} />
          VIZFLOW
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                background: page === item.id ? 'rgba(0,207,255,0.08)' : 'transparent',
                border: 'none',
                borderBottom: page === item.id ? '2px solid #00CFFF' : '2px solid transparent',
                color: page === item.id ? '#00CFFF' : 'rgba(180,210,255,0.5)',
                padding: '0 18px', height: 54,
                cursor: 'pointer',
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                fontSize: 14, letterSpacing: 1.5,
                transition: 'all 0.18s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: 'rgba(0,207,255,0.4)', letterSpacing: 2,
        }}>
          SYS_VIZ · 2.1
        </div>
      </nav>

      <div style={{ paddingTop: 56 }}>
        {page === 'home' && <Home onNavigate={setPage} />}
        {page === 'pathfinding' && <Pathfinding />}
        {page === 'dataflow' && <DataFlow />}
        {page === 'warehouse' && <DataWarehouse />}
      </div>
    </div>
  )
}
