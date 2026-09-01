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

const SVG_W = 540
const SVG_H = 690
const NW = 120
const NH = 48

const NODES: Record<NodeId, NodeDef> = {
  browser:   { cx: 140, cy: 52,  label: 'Browser',       sub: 'HTTP / Web Client',  color: '#00CFFF', group: 'client' },
  mobile:    { cx: 390, cy: 52,  label: 'Mobile App',    sub: 'iOS · Android SDK',  color: '#00CFFF', group: 'client' },
  lb:        { cx: 265, cy: 138, label: 'Load Balancer', sub: 'NGINX · L4 / L7',    color: '#7B8CDE', group: 'infra' },
  gateway:   { cx: 265, cy: 224, label: 'API Gateway',   sub: 'Auth · Rate Limit',  color: '#7B8CDE', group: 'infra' },
  orderSvc:  { cx: 95,  cy: 322, label: 'Order Svc',     sub: 'Node.js · gRPC',     color: '#00FF8A', group: 'service' },
  userSvc:   { cx: 265, cy: 322, label: 'User Svc',      sub: 'Go · REST API',      color: '#00FF8A', group: 'service' },
  paySvc:    { cx: 435, cy: 322, label: 'Payment Svc',   sub: 'Java · TLS 1.3',     color: '#00FF8A', group: 'service' },
  mysql:     { cx: 95,  cy: 420, label: 'MySQL 8.0',     sub: 'Orders Primary DB',  color: '#FFB347', group: 'data' },
  redis:     { cx: 265, cy: 420, label: 'Redis 7',       sub: 'Session & Token DB', color: '#FFB347', group: 'data' },
  pg:        { cx: 435, cy: 420, label: 'PostgreSQL',    sub: 'Ledger / Finance',   color: '#FFB347', group: 'data' },
  kafka:     { cx: 265, cy: 516, label: 'Apache Kafka',  sub: '3 Topics · 12 Part', color: '#FF6B8A', group: 'mq' },
  analytics: { cx: 95,  cy: 614, label: 'ClickHouse',   sub: 'OLAP Analytics',     color: '#A78BFA', group: 'output' },
  ml:        { cx: 265, cy: 614, label: 'ML Pipeline',   sub: 'Feature Store',      color: '#A78BFA', group: 'output' },
  lake:      { cx: 435, cy: 614, label: 'Data Lake',     sub: 'S3 · Parquet',       color: '#A78BFA', group: 'output' },
}

type EdgeDef = [NodeId, NodeId, number, number, string] // [from, to, count, dur, routeTag]

const EDGES: EdgeDef[] = [
  ['browser',   'lb',       2, 1.8, 'order'],
  ['mobile',    'lb',       2, 2.1, 'payment'],
  ['lb',        'gateway',  3, 1.4, 'common'],
  ['gateway',   'orderSvc', 2, 1.9, 'order'],
  ['gateway',   'userSvc',  2, 1.6, 'user'],
  ['gateway',   'paySvc',   1, 2.3, 'payment'],
  ['orderSvc',  'mysql',    2, 1.5, 'order'],
  ['userSvc',   'redis',    2, 1.7, 'user'],
  ['paySvc',    'pg',       2, 2.0, 'payment'],
  ['mysql',     'kafka',    2, 1.8, 'order'],
  ['redis',     'kafka',    1, 2.2, 'user'],
  ['pg',        'kafka',    2, 1.6, 'payment'],
  ['kafka',     'analytics',2, 2.0, 'common'],
  ['kafka',     'ml',       2, 1.8, 'common'],
  ['kafka',     'lake',     2, 2.2, 'common'],
]

const LAYERS = [
  { y: 52,  label: '01 · CLIENT LAYER' },
  { y: 138, label: '02 · INGRESS / LOAD BALANCER' },
  { y: 224, label: '03 · API GATEWAY / SECURITY' },
  { y: 322, label: '04 · MICROSERVICES CLUSTER' },
  { y: 420, label: '05 · DATA PERSISTENCE' },
  { y: 516, label: '06 · EVENT BUS (KAFKA)' },
  { y: 614, label: '07 · ANALYTICS & DATA LAKE' },
]

type RouteMode = 'all' | 'order' | 'payment' | 'user'
type PresetStyle = 'cyber' | 'signal' | 'blueprint'

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
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null)
  const [routeMode, setRouteMode] = useState<RouteMode>('all')
  const [preset, setPreset] = useState<PresetStyle>('cyber')

  const activeFocusNode = selectedNode || hoveredNode

  const isEdgeInRoute = (from: NodeId, to: NodeId, tag: string) => {
    if (routeMode === 'all') return true
    if (tag === 'common') return true
    return tag === routeMode
  }

  const isEdgeHighlighted = (from: NodeId, to: NodeId, tag: string) => {
    if (activeFocusNode) {
      return from === activeFocusNode || to === activeFocusNode
    }
    return isEdgeInRoute(from, to, tag)
  }

  const getUpstreamNodes = (nodeId: NodeId): NodeId[] => {
    return EDGES.filter(([, to]) => to === nodeId).map(([from]) => from)
  }

  const getDownstreamNodes = (nodeId: NodeId): NodeId[] => {
    return EDGES.filter(([from]) => from === nodeId).map(([, to]) => to)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', padding: '40px 48px' }}>
      {/* Header */}
      <div style={{ maxWidth: 1160, margin: '0 auto 32px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginBottom: 12,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: 'rgba(0,207,255,0.7)', letterSpacing: 3,
          }}>
            // ARCHITECTURE & ROUTE PROBE · ARCHIFY SPEC
          </div>
          {/* Preset Selector */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(10,16,40,0.8)', padding: '4px 6px', border: '1px solid rgba(0,207,255,0.18)', borderRadius: 4 }}>
            {(['cyber', 'signal', 'blueprint'] as PresetStyle[]).map(p => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                style={{
                  background: preset === p ? 'rgba(0,207,255,0.18)' : 'transparent',
                  border: 'none',
                  color: preset === p ? '#00CFFF' : 'rgba(180,210,240,0.5)',
                  padding: '4px 10px',
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  fontWeight: preset === p ? 700 : 500,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
            fontSize: 38, color: '#E2EEFF', margin: 0,
          }}>
            企业微服务数据流转图谱
          </h1>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: 'rgba(0,207,255,0.6)', letterSpacing: 2,
          }}>
            Architecture · Route Probe · Reach Analysis
          </div>
        </div>

        {/* Route Probe Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(178,210,240,0.5)' }}>
            ROUTE PROBE:
          </span>
          {[
            { id: 'all', label: '全链路 (All Paths)' },
            { id: 'order', label: '订单流 (Order → MySQL → Kafka)' },
            { id: 'payment', label: '支付流 (Payment → PG → Kafka)' },
            { id: 'user', label: '用户会话 (User → Redis → Kafka)' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => {
                setRouteMode(r.id as RouteMode)
                setSelectedNode(null)
              }}
              style={{
                background: routeMode === r.id ? 'rgba(0,207,255,0.15)' : 'rgba(5,9,26,0.6)',
                border: routeMode === r.id ? '1px solid #00CFFF' : '1px solid rgba(0,207,255,0.15)',
                color: routeMode === r.id ? '#00CFFF' : 'rgba(180,210,240,0.6)',
                padding: '6px 14px',
                borderRadius: 999,
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: `${SVG_W}px 1fr`, gap: 40, alignItems: 'start' }}>

        {/* Diagram Canvas */}
        <div style={{
          border: preset === 'blueprint' ? '1px solid rgba(0,180,255,0.35)' : '1px solid rgba(0,207,255,0.18)',
          background: preset === 'blueprint'
            ? 'radial-gradient(circle at 50% 50%, rgba(0,100,200,0.08), rgba(5,15,35,0.95))'
            : preset === 'signal'
            ? 'radial-gradient(circle at 80% 20%, rgba(0,255,138,0.05), rgba(5,9,26,0.95))'
            : 'rgba(5,9,26,0.85)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          {/* Preset Blueprint Overlay */}
          {preset === 'blueprint' && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'linear-gradient(rgba(0,207,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,207,255,0.06) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
          )}

          <svg width={SVG_W} height={SVG_H} style={{ display: 'block' }}>
            {/* Layer separators */}
            {LAYERS.map((layer, i) => i > 0 && (
              <line
                key={layer.label}
                x1={12} y1={layer.y - 42}
                x2={SVG_W - 12} y2={layer.y - 42}
                stroke="rgba(0,207,255,0.08)" strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}

            {/* Layer labels */}
            {LAYERS.map(layer => (
              <text
                key={layer.label}
                x={12} y={layer.y - 48}
                fill="rgba(0,207,255,0.35)"
                fontSize={9} fontFamily="JetBrains Mono, monospace"
                letterSpacing={1.2}
                fontWeight={600}
              >
                {layer.label}
              </text>
            ))}

            {/* Edges */}
            {EDGES.map(([from, to, , , tag]) => {
              const n1 = NODES[from], n2 = NODES[to]
              const active = isEdgeHighlighted(from, to, tag)
              const dimmed = (routeMode !== 'all' && !isEdgeInRoute(from, to, tag)) || (activeFocusNode && from !== activeFocusNode && to !== activeFocusNode)

              return (
                <line
                  key={`${from}-${to}`}
                  x1={n1.cx} y1={n1.cy}
                  x2={n2.cx} y2={n2.cy}
                  stroke={active ? '#00CFFF' : 'rgba(0,207,255,0.18)'}
                  strokeWidth={active ? 2 : 1}
                  opacity={dimmed ? 0.15 : active ? 1 : 0.6}
                  style={{ transition: 'all 0.2s ease' }}
                />
              )
            })}

            {/* Particles */}
            {EDGES.map(([from, to, count, dur, tag]) => {
              const inRoute = isEdgeInRoute(from, to, tag)
              if (!inRoute && routeMode !== 'all') return null
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
              const isSelected = selectedNode === id
              const isFocal = isHovered || isSelected

              const isUpstreamOfFocus = activeFocusNode ? getUpstreamNodes(activeFocusNode).includes(id) : false
              const isDownstreamOfFocus = activeFocusNode ? getDownstreamNodes(activeFocusNode).includes(id) : false
              const isRelated = isFocal || isUpstreamOfFocus || isDownstreamOfFocus
              const isDimmed = activeFocusNode && !isRelated

              return (
                <g
                  key={id}
                  onClick={() => setSelectedNode(selectedNode === id ? null : id)}
                  onMouseEnter={() => setHoveredNode(id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Glow behind */}
                  {isFocal && (
                    <rect
                      x={nodeLeft(node) - 4} y={nodeTop(node) - 4}
                      width={NW + 8} height={NH + 8}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={1.5}
                      opacity={0.4}
                      rx={3}
                    />
                  )}
                  {/* Box */}
                  <rect
                    x={nodeLeft(node)} y={nodeTop(node)}
                    width={NW} height={NH}
                    fill={isSelected ? '#0D1B3E' : '#0A1028'}
                    stroke={isFocal ? node.color : isUpstreamOfFocus ? '#00CFFF' : isDownstreamOfFocus ? '#00FF8A' : node.color + '40'}
                    strokeWidth={isFocal ? 2 : 1}
                    opacity={isDimmed ? 0.35 : 1}
                    rx={2}
                    style={{ transition: 'all 0.18s ease' }}
                  />
                  {/* Color accent bar */}
                  <rect
                    x={nodeLeft(node)} y={nodeTop(node)}
                    width={3} height={NH}
                    fill={node.color}
                    opacity={isFocal ? 1 : 0.6}
                    rx={1}
                  />
                  {/* Label */}
                  <text
                    x={node.cx + 2} y={node.cy - 5}
                    textAnchor="middle"
                    fill={isFocal ? node.color : '#E2EEFF'}
                    fontSize={12}
                    fontFamily="Rajdhani, sans-serif"
                    fontWeight={700}
                    opacity={isDimmed ? 0.4 : 1}
                    style={{ transition: 'fill 0.15s' }}
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.cx + 2} y={node.cy + 10}
                    textAnchor="middle"
                    fill="rgba(178,210,240,0.6)"
                    fontSize={8}
                    fontFamily="JetBrains Mono, monospace"
                    opacity={isDimmed ? 0.4 : 1}
                  >
                    {node.sub}
                  </text>
                  {/* Pulse dot */}
                  <circle cx={nodeLeft(node) + NW - 8} cy={nodeTop(node) + 8} r={3} fill={node.color} opacity={isDimmed ? 0.2 : 0.8}>
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Info & Inspector Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Node & Reach Inspector */}
          <div style={{
            background: '#0A1028', border: '1px solid rgba(0,207,255,0.18)',
            padding: 24, borderRadius: 4,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 14,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                color: 'rgba(0,207,255,0.7)', letterSpacing: 2,
              }}>
                NODE & REACH INSPECTOR
              </div>
              {selectedNode && (
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'rgba(255,124,92,0.8)', cursor: 'pointer',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  }}
                >
                  [CLEAR FOCUS]
                </button>
              )}
            </div>

            {activeFocusNode ? (() => {
              const n = NODES[activeFocusNode]
              const upNodes = getUpstreamNodes(activeFocusNode)
              const downNodes = getDownstreamNodes(activeFocusNode)
              return (
                <div style={{ animation: 'fade-in 0.15s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 12, height: 12, background: n.color, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                      fontSize: 22, color: n.color,
                    }}>
                      {n.label}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                    color: 'rgba(178,210,240,0.65)', marginBottom: 16, letterSpacing: 1,
                  }}>
                    {n.sub} · Layer: {n.group.toUpperCase()}
                  </div>

                  {/* Upstream / Downstream Reach */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div style={{ padding: '10px 12px', background: 'rgba(0,207,255,0.06)', border: '1px solid rgba(0,207,255,0.15)', borderRadius: 3 }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(0,207,255,0.8)', marginBottom: 4 }}>
                        ▲ UPSTREAM REACH ({upNodes.length})
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#E2EEFF', lineHeight: 1.5 }}>
                        {upNodes.length > 0 ? upNodes.map(id => NODES[id].label).join(', ') : 'None (Entrypoint)'}
                      </div>
                    </div>

                    <div style={{ padding: '10px 12px', background: 'rgba(0,255,138,0.06)', border: '1px solid rgba(0,255,138,0.15)', borderRadius: 3 }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(0,255,138,0.8)', marginBottom: 4 }}>
                        ▼ DOWNSTREAM REACH ({downNodes.length})
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#E2EEFF', lineHeight: 1.5 }}>
                        {downNodes.length > 0 ? downNodes.map(id => NODES[id].label).join(', ') : 'None (Terminal)'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })() : (
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: 'rgba(0,207,255,0.4)', letterSpacing: 1, padding: '12px 0',
              }}>
                点击或悬停节点以分析上下游依赖链路 (Reach Analysis)
              </div>
            )}
          </div>

          {/* Topology Metrics */}
          <div style={{
            background: '#0A1028', border: '1px solid rgba(0,207,255,0.12)',
            padding: 22, borderRadius: 4,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.6)', letterSpacing: 2, marginBottom: 14,
            }}>
              TOPOLOGY METRICS
            </div>
            {[
              { label: '服务节点数 (Nodes)', value: Object.keys(NODES).length },
              { label: '有向调用边 (Directed Edges)', value: EDGES.length },
              { label: '架构分层数 (Layers)', value: LAYERS.length },
              { label: '当前活跃数据流 (Active Particles)', value: EDGES.reduce((a, [,,c]) => a + c, 0) },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(178,210,240,0.55)' }}>
                  {s.label}
                </span>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 18, color: '#00CFFF' }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Share Card & Export Notice */}
          <div style={{
            background: 'rgba(0,207,255,0.03)', border: '1px dashed rgba(0,207,255,0.2)',
            padding: 16, borderRadius: 4,
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#00CFFF', fontWeight: 700, marginBottom: 6 }}>
              // ARCHIFY EXPORT READY
            </div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(178,210,240,0.6)', margin: 0, lineHeight: 1.6 }}>
              支持生成标准 1200×630 Share Card（全景与高亮路径分享卡），可无缝嵌入 PR、README 与架构评审文档。
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
