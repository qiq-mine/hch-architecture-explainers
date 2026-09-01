import { useEffect, useRef, useState } from 'react'
import type { Page } from '../App'

const DEMOS: {
  id: Page
  tag: string
  title: string
  subtitle: string
  desc: string
  color: string
  icon: string
}[] = [
  {
    id: 'pathfinding',
    tag: 'ALGORITHM',
    title: '寻路算法可视化',
    subtitle: 'Dijkstra · A*',
    desc: '逐步展示算法如何在地图上探索节点，从起点发散到终点，直观呈现最短路径的发现过程。',
    color: '#00CFFF',
    icon: '◎',
  },
  {
    id: 'dataflow',
    tag: 'ARCHITECTURE',
    title: '企业数据流转',
    subtitle: 'Microservice Architecture',
    desc: '直观呈现一次请求如何穿越 API 网关、鉴权层、微服务集群，再落库并发布到消息队列。',
    color: '#00FF8A',
    icon: '⬡',
  },
  {
    id: 'warehouse',
    tag: 'DATA PIPELINE',
    title: '数据入湖流程',
    subtitle: 'Data Warehouse · ETL',
    desc: '从多源采集、Kafka 传输、ODS 贴源到 DWD/DWS/ADS 各层加工，全链路动态演示。',
    color: '#FF7C5C',
    icon: '▦',
  },
]

const WHY = [
  { n: '01', title: '时序与顺序', desc: '数据流转的先后关系、算法的迭代步骤，静态箭头图无法表达时间维度。' },
  { n: '02', title: '跨团队对齐', desc: '非技术的业务方、PM、设计师都能一眼看懂系统是如何运作的。' },
  { n: '03', title: '瓶颈定位', desc: '在哪个节点出了问题？数据在哪里丢失？动画让故障点无所遁形。' },
  { n: '04', title: '方案评审', desc: '提案阶段让听众直观感受架构差异，而不是翻阅枯燥的技术文档。' },
]

function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const W = canvas.width
    const H = canvas.height

    // Nodes for the hero graph
    const nodes = [
      { x: 0.15, y: 0.2, r: 5, phase: 0 },
      { x: 0.45, y: 0.1, r: 4, phase: 0.8 },
      { x: 0.75, y: 0.25, r: 6, phase: 1.6 },
      { x: 0.25, y: 0.55, r: 5, phase: 2.4 },
      { x: 0.55, y: 0.45, r: 7, phase: 0.4 },
      { x: 0.85, y: 0.55, r: 4, phase: 1.2 },
      { x: 0.15, y: 0.8, r: 5, phase: 2.0 },
      { x: 0.45, y: 0.75, r: 4, phase: 0.6 },
      { x: 0.72, y: 0.85, r: 6, phase: 1.8 },
    ]

    const edges = [
      [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
      [3, 4], [4, 5], [3, 6], [4, 7], [5, 8],
      [6, 7], [7, 8],
    ]

    // Particle state per edge
    const particles = edges.map(([a, b]) => ({
      a, b,
      t: Math.random(),
      speed: 0.003 + Math.random() * 0.004,
      active: Math.random() > 0.3,
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t += 0.012

      // Draw edges
      edges.forEach(([a, b]) => {
        const na = nodes[a], nb = nodes[b]
        ctx.beginPath()
        ctx.moveTo(na.x * W, na.y * H)
        ctx.lineTo(nb.x * W, nb.y * H)
        ctx.strokeStyle = 'rgba(0,207,255,0.12)'
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Draw particles
      particles.forEach(p => {
        if (!p.active) return
        p.t = (p.t + p.speed) % 1
        const na = nodes[p.a], nb = nodes[p.b]
        const px = na.x + (nb.x - na.x) * p.t
        const py = na.y + (nb.y - na.y) * p.t
        const alpha = Math.sin(p.t * Math.PI)
        ctx.beginPath()
        ctx.arc(px * W, py * H, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,207,255,${alpha * 0.9})`
        ctx.fill()
        // glow
        ctx.beginPath()
        ctx.arc(px * W, py * H, 5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,207,255,${alpha * 0.15})`
        ctx.fill()
      })

      // Draw nodes
      nodes.forEach((n, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t + n.phase)
        const glow = 0.3 + 0.5 * pulse

        // Outer glow
        const grad = ctx.createRadialGradient(n.x * W, n.y * H, 0, n.x * W, n.y * H, n.r * 4)
        grad.addColorStop(0, `rgba(0,207,255,${glow * 0.4})`)
        grad.addColorStop(1, 'rgba(0,207,255,0)')
        ctx.beginPath()
        ctx.arc(n.x * W, n.y * H, n.r * 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(n.x * W, n.y * H, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,207,255,${0.7 + pulse * 0.3})`
        ctx.fill()

        // Ring
        ctx.beginPath()
        ctx.arc(n.x * W, n.y * H, n.r + 3 + pulse * 2, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,207,255,${glow * 0.4})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Highlight path: 0-1-4-7-8
      const pathNodes = [0, 1, 4, 7, 8]
      for (let i = 0; i < pathNodes.length - 1; i++) {
        const na = nodes[pathNodes[i]], nb = nodes[pathNodes[i + 1]]
        const progress = (Math.sin(t * 0.7) * 0.5 + 0.5)
        ctx.beginPath()
        ctx.moveTo(na.x * W, na.y * H)
        ctx.lineTo(nb.x * W, nb.y * H)
        ctx.strokeStyle = `rgba(255,215,0,${0.15 + progress * 0.4})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={420}
      height={320}
      style={{ display: 'block', opacity: 0.9 }}
    />
  )
}

function DemoCard({
  demo, index, onNavigate,
}: {
  demo: (typeof DEMOS)[0]
  index: number
  onNavigate: (p: Page) => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(demo.id)}
      style={{
        background: hovered ? `rgba(${demo.color === '#00CFFF' ? '0,207,255' : demo.color === '#00FF8A' ? '0,255,138' : '255,124,92'},0.06)` : '#0A1028',
        border: `1px solid ${hovered ? demo.color + '40' : 'rgba(0,207,255,0.1)'}`,
        padding: '32px 28px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.4), 0 0 24px ${demo.color}15` : 'none',
        animation: `slide-up 0.5s ease ${index * 0.08}s both`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 0%, ${demo.color}08, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        color: demo.color, letterSpacing: 3,
        marginBottom: 16, opacity: 0.8,
      }}>
        {demo.tag}
      </div>
      <div style={{
        fontSize: 40, marginBottom: 16, lineHeight: 1,
        color: demo.color, filter: `drop-shadow(0 0 8px ${demo.color}60)`,
      }}>
        {demo.icon}
      </div>
      <h3 style={{
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
        fontSize: 22, color: '#E2EEFF', margin: '0 0 6px',
      }}>
        {demo.title}
      </h3>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        color: demo.color, letterSpacing: 2, marginBottom: 14, opacity: 0.7,
      }}>
        {demo.subtitle}
      </div>
      <p style={{
        fontSize: 13, color: 'rgba(178,210,240,0.6)',
        lineHeight: 1.7, margin: 0,
      }}>
        {demo.desc}
      </p>
      <div style={{
        marginTop: 24, display: 'flex', alignItems: 'center', gap: 6,
        color: demo.color, fontFamily: 'Rajdhani, sans-serif',
        fontWeight: 600, fontSize: 13, letterSpacing: 2,
        opacity: hovered ? 1 : 0.5, transition: 'opacity 0.2s',
      }}>
        查看演示 →
      </div>
    </div>
  )
}

export default function Home({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div>
      {/* ── HERO ── */}
      <section
        style={{
          minHeight: 'calc(100vh - 56px)',
          display: 'flex', alignItems: 'center',
          padding: '0 64px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: [
            'linear-gradient(rgba(0,207,255,0.035) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(0,207,255,0.035) 1px, transparent 1px)',
          ].join(','),
          backgroundSize: '48px 48px',
        }} />
        {/* Scan line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,207,255,0.15), transparent)',
          animation: 'scan-h 8s linear infinite',
          pointerEvents: 'none',
        }} />
        {/* Corner brackets */}
        {[
          { top: 40, left: 64, borderTop: true, borderLeft: true },
          { bottom: 40, right: 64, borderBottom: true, borderRight: true },
        ].map((style, i) => (
          <div key={i} style={{
            position: 'absolute', width: 44, height: 44,
            ...style,
            borderTop: style.borderTop ? '1.5px solid rgba(0,207,255,0.35)' : undefined,
            borderLeft: style.borderLeft ? '1.5px solid rgba(0,207,255,0.35)' : undefined,
            borderBottom: style.borderBottom ? '1.5px solid rgba(0,207,255,0.35)' : undefined,
            borderRight: style.borderRight ? '1.5px solid rgba(0,207,255,0.35)' : undefined,
          }} />
        ))}

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 80, maxWidth: 1200, margin: '0 auto', width: '100%',
          alignItems: 'center',
        }}>
          {/* Left */}
          <div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.6)', letterSpacing: 3, marginBottom: 28,
              animation: 'fade-in 0.5s ease',
            }}>
              // SYSTEM VISUALIZATION PLATFORM v2.1
            </div>
            <h1 style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
              fontSize: 'clamp(52px, 6vw, 76px)',
              lineHeight: 1.05, margin: '0 0 20px', color: '#E2EEFF',
              animation: 'slide-up 0.55s ease 0.1s both',
            }}>
              让技术思维<br />
              <span style={{ color: '#00CFFF', textShadow: '0 0 40px rgba(0,207,255,0.4)' }}>
                一眼看懂
              </span>
            </h1>
            <p style={{
              fontSize: 15, lineHeight: 1.8, color: 'rgba(178,210,240,0.65)',
              maxWidth: 440, margin: '0 0 44px',
              animation: 'slide-up 0.55s ease 0.2s both',
            }}>
              算法如何遍历、数据如何在系统间流转、架构各组件如何协作——
              静态图表达不了的<em style={{ color: 'rgba(0,207,255,0.7)', fontStyle: 'normal' }}>"过程"</em>，用动画说清楚。
            </p>
            <div style={{
              display: 'flex', gap: 12,
              animation: 'slide-up 0.55s ease 0.3s both',
            }}>
              <button
                onClick={() => onNavigate('pathfinding')}
                style={{
                  background: '#00CFFF', color: '#05091A',
                  border: 'none', padding: '13px 32px',
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                  fontSize: 14, letterSpacing: 2, cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 0 24px rgba(0,207,255,0.25)',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 36px rgba(0,207,255,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 24px rgba(0,207,255,0.25)')}
              >
                查看演示
              </button>
              <button
                onClick={() => onNavigate('dataflow')}
                style={{
                  background: 'transparent', color: '#00CFFF',
                  border: '1px solid rgba(0,207,255,0.3)',
                  padding: '13px 32px',
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                  fontSize: 14, letterSpacing: 2, cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,207,255,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,207,255,0.3)')}
              >
                了解架构
              </button>
            </div>
          </div>

          {/* Right: animated graph */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              border: '1px solid rgba(0,207,255,0.12)',
              padding: 2, background: 'rgba(0,207,255,0.03)',
              boxShadow: '0 0 60px rgba(0,207,255,0.08)',
            }}>
              <HeroCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMOS ── */}
      <section style={{ padding: '96px 64px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 52 }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: 'rgba(0,207,255,0.55)', letterSpacing: 3, marginBottom: 14,
          }}>
            // DEMO GALLERY
          </div>
          <h2 style={{
            fontFamily: 'Rajdhani, sans-serif', fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 700, margin: 0, color: '#E2EEFF',
          }}>
            三种核心演示场景
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {DEMOS.map((demo, i) => (
            <DemoCard key={demo.id} demo={demo} index={i} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* ── WHY ── */}
      <section style={{
        padding: '96px 64px',
        borderTop: '1px solid rgba(0,207,255,0.07)',
        background: 'linear-gradient(180deg, transparent, rgba(0,207,255,0.025))',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '5fr 7fr',
          gap: 80, maxWidth: 1200, margin: '0 auto', alignItems: 'start',
        }}>
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.55)', letterSpacing: 3, marginBottom: 14,
            }}>
              // WHY ANIMATED
            </div>
            <h2 style={{
              fontFamily: 'Rajdhani, sans-serif', fontSize: 42,
              fontWeight: 700, margin: '0 0 20px', color: '#E2EEFF', lineHeight: 1.15,
            }}>
              动态可视化<br />解决真实问题
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(178,210,240,0.5)', lineHeight: 1.7, margin: 0 }}>
              技术方案向非技术方传达时，最大的障碍是"过程感"缺失。
              动画图让每一步都可追溯、可暂停、可对齐。
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {WHY.map(item => (
              <div key={item.n} style={{
                background: 'rgba(0,207,255,0.03)',
                border: '1px solid rgba(0,207,255,0.09)',
                padding: '28px 24px',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,207,255,0.22)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,207,255,0.09)')}
              >
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  color: 'rgba(0,207,255,0.4)', marginBottom: 14,
                }}>
                  {item.n}
                </div>
                <div style={{
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                  fontSize: 18, color: '#E2EEFF', marginBottom: 10,
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: 12, color: 'rgba(178,210,240,0.55)', lineHeight: 1.7,
                }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(0,207,255,0.07)',
        padding: '32px 64px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
          fontSize: 16, color: '#00CFFF', letterSpacing: 4,
        }}>
          VIZFLOW
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: 'rgba(0,207,255,0.3)', letterSpacing: 2,
        }}>
          SYSTEM VISUALIZATION PLATFORM
        </div>
      </footer>
    </div>
  )
}
