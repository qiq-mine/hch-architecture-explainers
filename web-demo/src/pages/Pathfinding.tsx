import { useCallback, useEffect, useRef, useState } from 'react'

const ROWS = 15
const COLS = 27
const START: [number, number] = [7, 1]
const END: [number, number] = [7, 25]
const CELL_SIZE = 26

type CellType = 'empty' | 'wall' | 'start' | 'end'
type CellState = 'unvisited' | 'frontier' | 'visited' | 'path'

function makePRNG(seed: number) {
  let s = seed
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0
    return ((s >>> 0) / 0xffffffff)
  }
}

function generateWalls(seed = 42): boolean[][] {
  const rand = makePRNG(seed)
  const walls: boolean[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(false))

  // Some structured horizontal barriers with gaps
  const barriers = [
    { row: 3, gaps: [6, 7, 14, 15, 22] },
    { row: 7, gaps: [7, 8, 13, 14, 19, 20] },   // main corridor (partial)
    { row: 11, gaps: [4, 5, 11, 12, 18, 19] },
  ]

  for (const b of barriers) {
    for (let c = 0; c < COLS; c++) {
      if (!b.gaps.includes(c)) {
        walls[b.row][c] = true
      }
    }
  }

  // Scatter random walls, respecting start/end zones
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (walls[r][c]) continue
      // Protect start/end areas
      const nearStart = Math.abs(r - START[0]) <= 1 && Math.abs(c - START[1]) <= 2
      const nearEnd = Math.abs(r - END[0]) <= 1 && Math.abs(c - END[1]) <= 2
      if (nearStart || nearEnd) continue
      if (rand() < 0.18) walls[r][c] = true
    }
  }

  // Ensure the main corridors through barriers are clear
  for (const b of barriers) {
    for (const g of b.gaps) {
      if (g >= 0 && g < COLS) walls[b.row][g] = false
    }
  }
  walls[START[0]][START[1]] = false
  walls[END[0]][END[1]] = false
  return walls
}

function bfs(walls: boolean[][]): { order: [number, number][]; path: Set<string>; found: boolean } {
  const visited = new Set<string>()
  const parent = new Map<string, string | null>()
  const queue: [number, number][] = [START]
  const key = (r: number, c: number) => `${r},${c}`
  const order: [number, number][] = []

  visited.add(key(START[0], START[1]))
  parent.set(key(START[0], START[1]), null)

  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  let found = false

  while (queue.length > 0 && !found) {
    const [r, c] = queue.shift()!
    order.push([r, c])
    if (r === END[0] && c === END[1]) { found = true; break }

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      const nk = key(nr, nc)
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited.has(nk) && !walls[nr][nc]) {
        visited.add(nk)
        parent.set(nk, key(r, c))
        queue.push([nr, nc])
      }
    }
  }

  const path = new Set<string>()
  if (found) {
    let cur: string | null = key(END[0], END[1])
    while (cur !== null) {
      path.add(cur)
      const prev = parent.get(cur)
      cur = prev ?? null
    }
  }

  return { order, path, found }
}

const SPEED_OPTIONS = [
  { label: '慢速', ms: 60 },
  { label: '正常', ms: 22 },
  { label: '快速', ms: 6 },
]

export default function Pathfinding() {
  const [walls, setWalls] = useState<boolean[][]>(() => generateWalls(42))
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [algo] = useState<'BFS (Dijkstra)'>('BFS (Dijkstra)')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { order, path, found } = bfs(walls)

  const reset = useCallback((seed?: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRunning(false)
    setStep(-1)
    if (seed !== undefined) setWalls(generateWalls(seed))
  }, [])

  const start = useCallback(() => {
    if (step >= order.length) return
    setRunning(true)
  }, [step, order.length])

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setStep(s => {
        if (s >= order.length - 1) {
          setRunning(false)
          return s
        }
        return s + 1
      })
    }, SPEED_OPTIONS[speedIdx].ms)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running, speedIdx, order.length])

  const visitedSet = new Set(order.slice(0, step + 1).map(([r, c]) => `${r},${c}`))
  const donePath = step >= order.length - 1 && found

  const getCellStyle = (r: number, c: number): React.CSSProperties => {
    const k = `${r},${c}`
    const isStart = r === START[0] && c === START[1]
    const isEnd = r === END[0] && c === END[1]
    const isWall = walls[r][c]
    const isPath = donePath && path.has(k) && !isStart && !isEnd
    const isVisited = visitedSet.has(k) && !isStart && !isEnd
    const isFrontier = isVisited && order[step] && order[step][0] === r && order[step][1] === c

    if (isStart) return { background: '#00FF8A', boxShadow: '0 0 12px #00FF8A' }
    if (isEnd) return { background: '#FF4060', boxShadow: '0 0 12px #FF4060' }
    if (isWall) return { background: '#060C1E', borderColor: 'transparent' }
    if (isPath) return {
      background: '#FFD700',
      boxShadow: '0 0 8px rgba(255,215,0,0.7)',
      animation: 'path-glow 1s ease-in-out infinite',
    }
    if (isFrontier) return {
      background: '#00CFFF',
      boxShadow: '0 0 10px rgba(0,207,255,0.8)',
    }
    if (isVisited) return {
      background: 'rgba(0,207,255,0.18)',
      borderColor: 'rgba(0,207,255,0.25)',
    }
    return {}
  }

  const visitedCount = visitedSet.size
  const pathLength = donePath ? path.size : 0

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', padding: '48px 48px' }}>
      {/* Header */}
      <div style={{ maxWidth: 900, margin: '0 auto 40px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: 'rgba(0,207,255,0.55)', letterSpacing: 3, marginBottom: 10,
        }}>
          // ALGORITHM VISUALIZATION
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
            fontSize: 40, color: '#E2EEFF', margin: 0,
          }}>
            寻路算法可视化
          </h1>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: 'rgba(0,207,255,0.5)', letterSpacing: 2,
          }}>
            {algo}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 220px', gap: 32, alignItems: 'start' }}>

        {/* Grid */}
        <div>
          <div style={{
            display: 'inline-block',
            border: '1px solid rgba(0,207,255,0.15)',
            padding: 2,
            background: 'rgba(0,207,255,0.02)',
            boxShadow: '0 0 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
              gap: 1,
              background: 'rgba(0,207,255,0.06)',
            }}>
              {Array.from({ length: ROWS }, (_, r) =>
                Array.from({ length: COLS }, (_, c) => {
                  const cellStyle = getCellStyle(r, c)
                  return (
                    <div
                      key={`${r}-${c}`}
                      style={{
                        width: CELL_SIZE, height: CELL_SIZE,
                        background: '#090E20',
                        border: '1px solid rgba(0,207,255,0.07)',
                        transition: 'background 0.12s ease, box-shadow 0.12s ease',
                        ...cellStyle,
                      }}
                    />
                  )
                })
              )}
            </div>
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap',
          }}>
            {[
              { color: '#00FF8A', label: '起点' },
              { color: '#FF4060', label: '终点' },
              { color: 'rgba(0,207,255,0.2)', border: '1px solid rgba(0,207,255,0.3)', label: '已访问' },
              { color: '#00CFFF', label: '当前探索' },
              { color: '#FFD700', label: '最短路径' },
              { color: '#060C1E', border: '1px solid rgba(255,255,255,0.05)', label: '障碍物' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 12, height: 12,
                  background: item.color,
                  border: item.border,
                  flexShrink: 0,
                }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(178,210,240,0.5)' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Controls */}
          <div style={{
            background: '#0A1028', border: '1px solid rgba(0,207,255,0.1)',
            padding: 20,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.5)', letterSpacing: 2, marginBottom: 16,
            }}>
              CONTROLS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={running ? () => setRunning(false) : start}
                disabled={step >= order.length - 1 && !running}
                style={{
                  background: running ? 'rgba(255,64,96,0.15)' : 'rgba(0,207,255,0.12)',
                  border: running ? '1px solid rgba(255,64,96,0.4)' : '1px solid rgba(0,207,255,0.3)',
                  color: running ? '#FF4060' : '#00CFFF',
                  padding: '10px 16px', cursor: 'pointer',
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                  fontSize: 13, letterSpacing: 2,
                  transition: 'all 0.15s',
                  opacity: (step >= order.length - 1 && !running) ? 0.4 : 1,
                }}
              >
                {running ? '⏸ 暂停' : step < 0 ? '▶ 开始' : '▶ 继续'}
              </button>
              <button
                onClick={() => reset(42)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(0,207,255,0.15)',
                  color: 'rgba(178,210,240,0.6)',
                  padding: '10px 16px', cursor: 'pointer',
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                  fontSize: 13, letterSpacing: 2,
                }}
              >
                ↺ 重置
              </button>
              <button
                onClick={() => { reset(Math.floor(Math.random() * 999)) }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(0,207,255,0.15)',
                  color: 'rgba(178,210,240,0.6)',
                  padding: '10px 16px', cursor: 'pointer',
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                  fontSize: 13, letterSpacing: 2,
                }}
              >
                ⟳ 随机地图
              </button>
            </div>

            {/* Speed */}
            <div style={{ marginTop: 20 }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                color: 'rgba(0,207,255,0.4)', letterSpacing: 2, marginBottom: 10,
              }}>
                SPEED
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {SPEED_OPTIONS.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => setSpeedIdx(i)}
                    style={{
                      flex: 1, padding: '6px 4px', cursor: 'pointer',
                      background: speedIdx === i ? 'rgba(0,207,255,0.15)' : 'transparent',
                      border: speedIdx === i ? '1px solid rgba(0,207,255,0.4)' : '1px solid rgba(0,207,255,0.1)',
                      color: speedIdx === i ? '#00CFFF' : 'rgba(178,210,240,0.4)',
                      fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 11,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            background: '#0A1028', border: '1px solid rgba(0,207,255,0.1)',
            padding: 20,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.5)', letterSpacing: 2, marginBottom: 16,
            }}>
              STATS
            </div>
            {[
              { label: '已访问节点', value: visitedCount, color: '#00CFFF' },
              { label: '总节点数', value: ROWS * COLS - walls.flat().filter(Boolean).length, color: 'rgba(178,210,240,0.5)' },
              { label: '路径长度', value: pathLength || '—', color: '#FFD700' },
              { label: '探索进度', value: order.length > 0 ? `${Math.round((visitedCount / order.length) * 100)}%` : '0%', color: '#00FF8A' },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 14 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                  color: 'rgba(0,207,255,0.35)', marginBottom: 3,
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                  fontSize: 22, color: s.color,
                }}>
                  {s.value}
                </div>
              </div>
            ))}

            {donePath && (
              <div style={{
                marginTop: 8, padding: '8px 12px',
                background: 'rgba(0,255,138,0.08)',
                border: '1px solid rgba(0,255,138,0.25)',
                color: '#00FF8A',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, letterSpacing: 1,
              }}>
                ✓ 路径已找到
              </div>
            )}
            {step >= order.length - 1 && !found && step >= 0 && (
              <div style={{
                marginTop: 8, padding: '8px 12px',
                background: 'rgba(255,64,96,0.08)',
                border: '1px solid rgba(255,64,96,0.25)',
                color: '#FF4060',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, letterSpacing: 1,
              }}>
                ✕ 无可行路径
              </div>
            )}
          </div>

          {/* Algorithm info */}
          <div style={{
            background: '#0A1028', border: '1px solid rgba(0,207,255,0.1)',
            padding: 20,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.5)', letterSpacing: 2, marginBottom: 12,
            }}>
              ALGORITHM
            </div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 15, color: '#E2EEFF', marginBottom: 8 }}>
              Dijkstra / BFS
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(178,210,240,0.4)', lineHeight: 1.8 }}>
              时间复杂度: O(V + E)<br />
              空间复杂度: O(V)<br />
              权重: 均匀 (1 per step)<br />
              保证最短路径: ✓
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
