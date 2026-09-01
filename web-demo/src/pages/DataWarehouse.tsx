import { useEffect, useRef, useState } from 'react'

interface Source {
  label: string; sub: string; color: string
}

interface Stage {
  id: string
  label: string
  sub: string
  desc: string
  color: string
  tech: string[]
  sources?: Source[]
}

const STAGES: Stage[] = [
  {
    id: 'sources',
    label: '数据源层',
    sub: 'Source Systems',
    desc: '来自各业务系统的原始数据，包括关系型数据库、日志系统、埋点采集和第三方 API。',
    color: '#00CFFF',
    tech: ['MySQL', 'PostgreSQL', 'Kafka Producer', 'SDK 埋点', 'REST API'],
    sources: [
      { label: 'CRM 系统', sub: 'MySQL 8.0', color: '#00CFFF' },
      { label: 'ERP 系统', sub: 'PostgreSQL', color: '#00CFFF' },
      { label: '行为埋点', sub: 'SDK Tracker', color: '#00CFFF' },
      { label: '第三方 API', sub: 'REST · Webhook', color: '#00CFFF' },
      { label: '日志系统', sub: 'App Logs', color: '#00CFFF' },
    ],
  },
  {
    id: 'ingestion',
    label: '采集 & 调度层',
    sub: 'Ingestion Layer',
    desc: '通过 Kafka 实时流、Fluentd 日志采集和 Airflow DAG 定时批量拉取，将多源数据统一汇入存储。',
    color: '#7B8CDE',
    tech: ['Apache Kafka', 'Apache Fluentd', 'Apache Airflow', 'DataX', 'Debezium CDC'],
  },
  {
    id: 'ods',
    label: 'ODS 贴源层',
    sub: 'Operational Data Store',
    desc: '原始数据原样落盘，保留全量历史快照，不做任何业务加工，是数仓的"原材料仓库"。',
    color: '#00FF8A',
    tech: ['Hive', 'HDFS', 'OSS/S3', 'Parquet', 'ORC'],
  },
  {
    id: 'dwd',
    label: 'DWD 明细层',
    sub: 'Data Warehouse Detail',
    desc: '对贴源数据进行清洗、去重、类型规范化和维度关联，形成干净的、面向业务的明细宽表。',
    color: '#FFB347',
    tech: ['Apache Spark', 'Flink SQL', 'dbt', 'Great Expectations'],
  },
  {
    id: 'dws',
    label: 'DWS 汇总层',
    sub: 'Data Warehouse Summary',
    desc: '基于 DWD 明细数据，按业务主题（用户、订单、商品）进行聚合计算，生成每日/每周粒度汇总指标。',
    color: '#FF7C5C',
    tech: ['Spark SQL', 'ClickHouse MV', 'Presto', 'Apache Doris'],
  },
  {
    id: 'ads',
    label: 'ADS 应用层',
    sub: 'Application Data Store',
    desc: '面向具体产品和报表需求定制，直接支撑 BI 取数、API 查询和算法特征工程。',
    color: '#FF6B8A',
    tech: ['ClickHouse', 'Elasticsearch', 'Redis', 'MySQL (同步)'],
  },
  {
    id: 'output',
    label: '数据出口层',
    sub: 'Data Serving',
    desc: '通过 BI 报表工具、数据 API 和 ML 特征仓库，将数据价值输送给最终消费方。',
    color: '#A78BFA',
    tech: ['Superset', 'Metabase', 'Feature Store', '数据 API 网关'],
    sources: [
      { label: 'BI 报表', sub: 'Superset · Metabase', color: '#A78BFA' },
      { label: '数据 API', sub: 'REST · GraphQL', color: '#A78BFA' },
      { label: 'ML 特征仓', sub: 'Feature Store', color: '#A78BFA' },
      { label: '实时大屏', sub: 'Grafana · ECharts', color: '#A78BFA' },
    ],
  },
]

function useAnimatedStep(total: number, delay = 600) {
  const [active, setActive] = useState(-1)
  const [running, setRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setActive(a => {
        if (a >= total - 1) { setRunning(false); return a }
        return a + 1
      })
    }, delay)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running, total, delay])

  const reset = () => { setRunning(false); setActive(-1) }
  const start = () => { if (active >= total - 1) setActive(-1); setRunning(true) }

  return { active, running, start, reset }
}

function FlowArrow({ color, active }: { color: string; active: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      height: 36, justifyContent: 'center', position: 'relative',
    }}>
      <div style={{
        width: 1.5,
        height: '100%',
        background: active ? color : 'rgba(0,207,255,0.1)',
        transition: 'background 0.4s',
        position: 'relative',
        overflow: 'visible',
      }}>
        {active && (
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 6, height: 6, borderRadius: '50%',
            background: color,
            boxShadow: `0 0 8px ${color}`,
            animation: 'scan-h 0.8s linear infinite',
          }} />
        )}
      </div>
      <div style={{
        width: 0, height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: `6px solid ${active ? color : 'rgba(0,207,255,0.1)'}`,
        transition: 'border-top-color 0.4s',
      }} />
    </div>
  )
}

function SourceChip({ s, visible }: { s: Source; visible: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: `${s.color}0A`,
      border: `1px solid ${s.color}25`,
      padding: '6px 12px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'all 0.35s ease',
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 12, color: '#E2EEFF' }}>
          {s.label}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'rgba(178,210,240,0.4)' }}>
          {s.sub}
        </div>
      </div>
    </div>
  )
}

function StageCard({ stage, active, index }: { stage: Stage; active: boolean; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: active ? `${stage.color}08` : '#0A1028',
      border: `1px solid ${active ? stage.color + '40' : 'rgba(0,207,255,0.08)'}`,
      padding: '20px 24px',
      transition: 'all 0.4s ease',
      boxShadow: active ? `0 0 24px ${stage.color}18` : 'none',
      cursor: 'pointer',
    }}
      onClick={() => setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Step number */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          border: `1.5px solid ${active ? stage.color : 'rgba(0,207,255,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? `${stage.color}18` : 'transparent',
          transition: 'all 0.3s',
          boxShadow: active ? `0 0 12px ${stage.color}40` : 'none',
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 500,
            color: active ? stage.color : 'rgba(0,207,255,0.3)',
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <div style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
              fontSize: 18, color: active ? stage.color : '#E2EEFF',
              transition: 'color 0.3s',
            }}>
              {stage.label}
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
              color: 'rgba(0,207,255,0.35)', letterSpacing: 1.5,
            }}>
              {stage.sub}
            </div>
          </div>

          {/* Tech tags */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {stage.tech.map(t => (
              <span key={t} style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                color: active ? stage.color : 'rgba(0,207,255,0.35)',
                background: active ? `${stage.color}10` : 'rgba(0,207,255,0.04)',
                border: `1px solid ${active ? stage.color + '25' : 'rgba(0,207,255,0.08)'}`,
                padding: '2px 7px',
                transition: 'all 0.3s',
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Status indicator */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: active ? stage.color : 'rgba(0,207,255,0.12)',
          boxShadow: active ? `0 0 10px ${stage.color}` : 'none',
          transition: 'all 0.3s',
          animation: active ? 'badge-blink 1.5s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }} />
      </div>

      {/* Expanded desc */}
      {(expanded || active) && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: `1px solid ${stage.color}18`,
          fontSize: 13, color: 'rgba(178,210,240,0.6)', lineHeight: 1.7,
          animation: 'fade-in 0.2s ease',
        }}>
          {stage.desc}
        </div>
      )}

      {/* Source chips for sources/output stages */}
      {stage.sources && (
        <div style={{
          marginTop: 14, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 8,
        }}>
          {stage.sources.map(s => (
            <SourceChip key={s.label} s={s} visible={active} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DataWarehouse() {
  const { active, running, start, reset } = useAnimatedStep(STAGES.length, 700)
  const [speed, setSpeed] = useState(1)

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', padding: '48px 48px' }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto 40px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: 'rgba(0,207,255,0.55)', letterSpacing: 3, marginBottom: 10,
        }}>
          // DATA PIPELINE VISUALIZATION
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
            fontSize: 40, color: '#E2EEFF', margin: 0,
          }}>
            数据入湖全链路流程
          </h1>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: 'rgba(0,207,255,0.5)', letterSpacing: 2,
          }}>
            Data Warehouse · Lambda Architecture
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(178,210,240,0.5)', lineHeight: 1.7, marginTop: 12, maxWidth: 620 }}>
          从多源业务系统采集，经 Kafka 流入 ODS 贴源层，逐层经过 DWD 明细、DWS 汇总、ADS 应用，
          最终输送到 BI、API 和 ML 各下游消费方。
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 40, alignItems: 'start' }}>

        {/* Pipeline */}
        <div>
          {STAGES.map((stage, i) => (
            <div key={stage.id}>
              <StageCard stage={stage} active={active >= i} index={i} />
              {i < STAGES.length - 1 && (
                <FlowArrow color={stage.color} active={active >= i} />
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Playback */}
          <div style={{
            background: '#0A1028', border: '1px solid rgba(0,207,255,0.1)',
            padding: 24,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.5)', letterSpacing: 2, marginBottom: 16,
            }}>
              PLAYBACK
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={running ? () => {} : start}
                style={{
                  background: running ? 'rgba(255,64,96,0.12)' : 'rgba(0,207,255,0.1)',
                  border: running ? '1px solid rgba(255,64,96,0.35)' : '1px solid rgba(0,207,255,0.3)',
                  color: running ? '#FF4060' : '#00CFFF',
                  padding: '11px 16px', cursor: 'pointer',
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                  fontSize: 13, letterSpacing: 2,
                }}
              >
                {running ? '⏸ 运行中...' : active < 0 ? '▶ 开始演示' : active >= STAGES.length - 1 ? '↺ 重新播放' : '▶ 继续'}
              </button>
              <button
                onClick={reset}
                style={{
                  background: 'transparent', border: '1px solid rgba(0,207,255,0.12)',
                  color: 'rgba(178,210,240,0.55)',
                  padding: '11px 16px', cursor: 'pointer',
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                  fontSize: 13, letterSpacing: 2,
                }}
              >
                ↺ 重置
              </button>
            </div>
          </div>

          {/* Progress */}
          <div style={{
            background: '#0A1028', border: '1px solid rgba(0,207,255,0.1)',
            padding: 24,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.5)', letterSpacing: 2, marginBottom: 16,
            }}>
              PROGRESS
            </div>

            {/* Bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                height: 3, background: 'rgba(0,207,255,0.08)',
                borderRadius: 2, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.max(0, (active + 1) / STAGES.length) * 100}%`,
                  background: 'linear-gradient(90deg, #00CFFF, #00FF8A)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                color: 'rgba(0,207,255,0.4)', marginTop: 6, textAlign: 'right',
              }}>
                {active + 1} / {STAGES.length} stages
              </div>
            </div>

            {/* Stage list */}
            {STAGES.map((s, i) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 10,
                opacity: active >= i ? 1 : 0.3,
                transition: 'opacity 0.4s',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: active >= i ? s.color : 'rgba(0,207,255,0.2)',
                  boxShadow: active === i ? `0 0 8px ${s.color}` : 'none',
                  transition: 'all 0.3s',
                }} />
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                  color: active >= i ? 'rgba(178,210,240,0.7)' : 'rgba(178,210,240,0.3)',
                  transition: 'color 0.3s',
                }}>
                  {s.sub}
                </span>
              </div>
            ))}
          </div>

          {/* Architecture info */}
          <div style={{
            background: '#0A1028', border: '1px solid rgba(0,207,255,0.1)',
            padding: 24,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: 'rgba(0,207,255,0.5)', letterSpacing: 2, marginBottom: 14,
            }}>
              ARCHITECTURE
            </div>
            {[
              { label: '架构模式', value: 'Lambda' },
              { label: '数据层级', value: `${STAGES.length} layers` },
              { label: '实时性', value: 'T+0 ~ T+1' },
              { label: '存储格式', value: 'Parquet / ORC' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(0,207,255,0.35)' }}>
                  {s.label}
                </span>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 13, color: '#E2EEFF' }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
