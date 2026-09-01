import { useState } from 'react'

type NodeId =
  | 'browser' | 'mobile'
  | 'lb'
  | 'gateway'
  | 'orderSvc' | 'userSvc' | 'paySvc'
  | 'mysql' | 'redis' | 'pg'
  | 'kafka'
  | 'analytics' | 'ml' | 'lake'

interface NodeDef {
  cx: number; cy: number
  label: string; sub: string; color: string; group: string
}

const SVG_W = 520
const SVG_H = 690
const NW = 118
const NH = 48

const NODES: Record<NodeId, NodeDef> = {
  browser:   { cx: 140, cy: 52,  label: 'Browser',       sub: 'HTTP Client',        color: '#00CFFF', group: 'client' },
  mobile:    { cx: 380, cy: 52,  label: 'Mobile App',    sub: 'iOS · Android',      color: '#00CFFF', group: 'client' },
  lb:        { cx: 260, cy: 138, label: 'Load Balancer', sub: 'NGINX · L4',         color: '#7B8CDE', group: 'infra' },
  gateway:   { cx: 260, cy: 224, label: 'API Gateway',   sub: 'Auth · Rate Limit',  color: '#7B8CDE', group: 'infra' },
  orderSvc:  { cx: 90,  cy: 322, label: 'Order Svc',     sub: 'Node.js · gRPC',     color: '#00FF8A', group: 'service' },
  userSvc:   { cx: 260, cy: 322, label: 'User Svc',      sub: 'Go · REST',          color: '#00FF8A', group: 'service' },
  paySvc:    { cx: 430, cy: 322, label: 'Payment Svc',   sub: 'Java · TLS 1.3',     color: '#00FF8A', group: 'service' },
  mysql:     { cx: 90,  cy: 420, label: 'MySQL 8.0',     sub: 'Orders DB',          color: '#FFB347', group: 'data' },
  redis:     { cx: 260, cy: 420, label: 'Redis 7',       sub: 'Session Cache',      color: '#FFB347', group: 'data' },
  pg:        { cx: 430, cy: 420, label: 'PostgreSQL',    sub: 'Finance DB',         color: '#FFB347', group: 'data' },
  kafka:     { cx: 260, cy: 516, label: 'Apache Kafka',  sub: '3 Topics · 12 Part', color: '#FF6B8A', group: 'mq' },
  analytics: { cx: 95,  cy: 614, label: 'ClickHouse',   sub: 'OLAP Analytics',     color: '#A78BFA', group: 'output' },
  ml:        { cx: 260, cy: 614, label: 'ML Pipeline',   sub: 'Airflow · Python',   color: '#A78BFA', group: 'output' },
  lake:      { cx: 425, cy: 614, label: 'Data Lake',     sub: 'S3 · Parquet',       color: '#A78BFA', group: 'output' },
}

const EDGES: Array<[NodeId, NodeId, number, number]> = [
  // [from, to, particleCount, durSeconds]
  ['browser',   'lb',       2, 1.8],
  ['mobile',    'lb',       2, 2.1],
  ['lb',        'gateway',  3, 1.4],
  ['gateway',   'orderSvc', 2, 1.9],
  ['gateway',   'userSvc',  2, 1.6],
  ['gateway',   'paySvc',   1, 2.3],
  ['orderSvc',  'mysql',    2, 1.5],
  ['userSvc',   'redis',    2, 1.7],
  ['paySvc',    'pg',       2, 2.0],
  ['mysql',     'kafka',    2, 1.8],
  ['redis',     'kafka',    1, 2.2],
  ['pg',        'kafka',    2, 1.6],
  ['kafka',     'analytics',2, 2.0],
  ['kafka',     'ml',       2, 1.8],
  ['kafka',     'lake',     2, 2.2],
]

const LAYERS = [
  { y: 52,  label: 'CLIENT LAYER' },
  { y: 138, label: 'LOAD BALANCER' },
  { y: 224, label: 'API GATEWAY' },
  { y: 322, label: 'SERVICE LAYER' },
  { y: 420, label: 'DATA STORE' },
  { y: 516, label: 'MESSAGE BUS' },
  { y: 614, label: 'ANALYTICS / ML' },
]

function nodeLeft(n: NodeDef) { return n.cx - NW / 2 }
function nodeTop(n: NodeDef) { return n.cy - NH / 2 }

function Particle({ x1, y1, x2, y2, dur, delay, color }: {
  x1: number; y1: number; x2: number; y2: number
  dur: number; delay: number; color: string
}) {
  const path = `M${x1},${y1} L${x2},${y2}`
  return (
    <circle r={3.5} fill={color} opacity={0}>
      <animateMotion
        dur={`${dur}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
        path={path}
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.08;0.92;1"
        dur={`${dur}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
      <animate
        attributeName="r"
        values="2;3.5;3.5;2"
        keyTimes="0;0.1;0.9;1"
        dur={`${dur}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </circle>
  )
}

export default function DataFlow() {
  const [hoveredNode, setHoveredNode] = useState<NodeId | null>(null)

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', padding: '48px 48px' }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto 40px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: 'rgba(0,207,255,0.55)', letterSpacing: 3, marginBottom: 10,
        }}>
          // ARCHITECTURE VISUALIZATION
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
            fontSize: 40, color: '#E2EEFF', margin: 0,
          }}>
            企业数据流转示意图
          </h1>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: 'rgba(0,207,255,0.5)', letterSpacing: 2,
          }}>
            Microservice Architecture
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(178,210,240,0.5)', lineHeight: 1.7, marginTop: 12, maxWidth: 620 }}>
          一次用户请求从客户端出发，穿越负载均衡、API 网关、鉴权层，进入微服务集群，
          落库并发布事件到 Kafka，最终流入 OLAP、ML 和数据湖。
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: `${SVG_W}px 1fr`, gap: 48, alignItems: 'start' }}>

        {/* Diagram */}
        <div style={{
          border: '1px solid rgba(0,207,255,0.12)',
          background: 'rgba(0,207,255,0.02)',
          boxShadow: '0 0 60px rgba(0,0,0,0.5)',
          position: 'relative',
        }}>
          {/* Layer labels on left */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: 0, pointerEvents: 'none',
          }} />

          <svg width={SVG_W} height={SVG_H} style={{ display: 'block' }}>
            {/* Layer separators */}
            {LAYERS.map((layer, i) => i > 0 && (
              <line
                key={layer.label}
                x1={12} y1={layer.y - 42}
                x2={SVG_W - 12} y2={layer.y - 42}
                stroke="rgba(0,207,255,0.06)" strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}

            {/* Layer labels */}
            {LAYERS.map(layer => (
              <text
                key={layer.label}
                x={10} y={layer.y - 50}
                fill="rgba(0,207,255,0.25)"
                fontSize={8} fontFamily="JetBrains Mono, monospace"
                letterSpacing={1.5}
              >
                {layer.label}
              </text>
            ))}

            {/* Edges */}
            {EDGES.map(([from, to]) => {
              const n1 = NODES[from], n2 = NODES[to]
              const isActive = hoveredNode === from || hoveredNode === to
              return (
                <line
                  key={`${from}-${to}`}
                  x1={n1.cx} y1={n1.cy}
                  x2={n2.cx} y2={n2.cy}
                  stroke={isActive ? 'rgba(0,207,255,0.4)' : 'rgba(0,207,255,0.14)'}
                  strokeWidth={isActive ? 1.5 : 1}
                  style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                />
              )
            })}

            {/* Particles */}
            {EDGES.map(([from, to, count, dur]) => {
              const n1 = NODES[from], n2 = NODES[to]
              const targetColor = NODES[to].color
              return Array.from({ length: count }, (_, i) => (
                <Particle
                  key={`p-${from}-${to}-${i}`}
                  x1={n1.cx} y1={n1.cy}
                  x2={n2.cx} y2={n2.cy}
                  dur={dur}
                  delay={(i / count) * dur}
                  color={targetColor}
                />
              ))
            })}

            {/* Node boxes */}
            {(Object.entries(NODES) as [NodeId, NodeDef][]).map(([id, node]) => {
              const isHovered = hoveredNode === id
              return (
                <g
                  key={id}
                  onMouseEnter={() => setHoveredNode(id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'default' }}
                >
                  {/* Glow behind */}
                  {isHovered && (
                    <rect
                      x={nodeLeft(node) - 4} y={nodeTop(node) - 4}
                      width={NW + 8} height={NH + 8}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={1}
                      opacity={0.3}
                      rx={2}
                    />
                  )}
                  {/* Box */}
                  <rect
                    x={nodeLeft(node)} y={nodeTop(node)}
                    width={NW} height={NH}
                    fill="#0A1028"
                    stroke={isHovered ? node.color : node.color + '28'}
                    strokeWidth={isHovered ? 1.5 : 1}
                    rx={2}
                    style={{ transition: 'stroke 0.15s' }}
                  />
                  {/* Color accent bar */}
                  <rect
                    x={nodeLeft(node)} y={nodeTop(node)}
                    width={3} height={NH}
                    fill={node.color}
                    opacity={isHovered ? 1 : 0.5}
                    rx={1}
                  />
                  {/* Label */}
                  <text
                    x={node.cx + 2} y={node.cy - 5}
                    textAnchor="middle"
                    fill={isHovered ? node.color : '#C8E0F8'}
                    fontSize={12}
                    fontFamily="Rajdhani, sans-serif"
                    fontWeight={700}
                    style={{ transition: 'fill 0.15s' }}
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.cx + 2} y={node.cy + 10}
                    textAnchor="middle"
                    fill="rgba(178,210,240,0.4)"
                    fontSize={8}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {node.sub}
                  </text>
                  {/* Pulse dot */}
                  <circle cx={nodeLeft(node) + NW - 8} cy={nodeTop(node) + 8} r={3} fill={node.color} opacity={0.7}>
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Hovered node details */}
          <div style={{
            background: '#0A1028', border: '1px solid rgba(0,207,255,0.1)',
            padding: 24, minHeight: 120,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.5)', letterSpacing: 2, marginBottom: 14,
            }}>
              NODE INSPECTOR
            </div>
            {hoveredNode ? (() => {
              const n = NODES[hoveredNode]
              const outgoing = EDGES.filter(([from]) => from === hoveredNode)
              const incoming = EDGES.filter(([, to]) => to === hoveredNode)
              return (
                <div style={{ animation: 'fade-in 0.15s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, background: n.color, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                      fontSize: 20, color: n.color,
                    }}>
                      {n.label}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                    color: 'rgba(178,210,240,0.5)', marginBottom: 14, letterSpacing: 1,
                  }}>
                    {n.sub}
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(0,207,255,0.4)', marginBottom: 4 }}>UPSTREAM</div>
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 22, color: '#E2EEFF' }}>{incoming.length}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(0,207,255,0.4)', marginBottom: 4 }}>DOWNSTREAM</div>
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 22, color: '#E2EEFF' }}>{outgoing.length}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(0,207,255,0.4)', marginBottom: 4 }}>LAYER</div>
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, color: '#E2EEFF', textTransform: 'uppercase' }}>{n.group}</div>
                    </div>
                  </div>
                </div>
              )
            })() : (
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                color: 'rgba(0,207,255,0.25)', letterSpacing: 1,
              }}>
                Hover a node to inspect
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{
            background: '#0A1028', border: '1px solid rgba(0,207,255,0.1)',
            padding: 24,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.5)', letterSpacing: 2, marginBottom: 16,
            }}>
              TOPOLOGY
            </div>
            {[
              { label: '服务节点数', value: Object.keys(NODES).length },
              { label: '连接边数', value: EDGES.length },
              { label: '层级数量', value: LAYERS.length },
              { label: '数据流粒子', value: EDGES.reduce((a, [,,c]) => a + c, 0) },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(178,210,240,0.45)' }}>
                  {s.label}
                </span>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 20, color: '#00CFFF' }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Color legend */}
          <div style={{
            background: '#0A1028', border: '1px solid rgba(0,207,255,0.1)',
            padding: 24,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.5)', letterSpacing: 2, marginBottom: 16,
            }}>
              LAYER COLORS
            </div>
            {[
              { color: '#00CFFF', label: '客户端层 (Client)' },
              { color: '#7B8CDE', label: '基础设施层 (Infra)' },
              { color: '#00FF8A', label: '微服务层 (Service)' },
              { color: '#FFB347', label: '数据存储层 (Data)' },
              { color: '#FF6B8A', label: '消息总线 (MQ)' },
              { color: '#A78BFA', label: '分析输出层 (Output)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, background: item.color, borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(178,210,240,0.55)' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
