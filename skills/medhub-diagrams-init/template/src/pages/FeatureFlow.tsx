import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { featuresBySystem } from '../data/features'
import { getFlow, type FlowActor, type FlowStep, type StepDetail, type StepKind } from '../data/flows'

const KIND_COLOR: Record<StepKind, string> = {
  action: '#2563eb',
  route: '#0f9d58',
  query: '#a16207',
  render: '#9aa0a6',
  external: '#0891b2',
  'cross-feature': '#9333ea',
}

const KIND_LABEL: Record<StepKind, string> = {
  action: 'User action',
  route: 'Route / controller',
  query: 'DB query',
  render: 'Render / response',
  external: 'External / sibling call',
  'cross-feature': 'Hand-off to another feature',
}

function isPersonActor(actor: FlowActor): boolean {
  return actor.role === 'user'
}

const COL_WIDTH = 200
const ROW_HEIGHT = 56
const TOP_PAD = 70
const LEFT_PAD = 40
const LOOP_WIDTH = 90

function SequenceDiagram({
  flow,
  selectedSeq,
  onStepClick,
}: {
  flow: { actors: FlowActor[]; steps: FlowStep[] }
  selectedSeq: number | null
  onStepClick: (seq: number) => void
}) {
  const { actors, steps } = flow
  const width = LEFT_PAD * 2 + (actors.length - 1) * COL_WIDTH + LOOP_WIDTH
  const height = TOP_PAD + steps.length * ROW_HEIGHT + 30

  const xFor = (actorId: string) => {
    const i = actors.findIndex((a) => a.id === actorId)
    return LEFT_PAD + Math.max(i, 0) * COL_WIDTH
  }

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #e2e2e2', borderRadius: 10, background: '#fff' }}>
      <svg width={width} height={height} style={{ display: 'block', minWidth: '100%' }} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          {(Object.keys(KIND_COLOR) as StepKind[]).map((k) => (
            <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={KIND_COLOR[k]} />
            </marker>
          ))}
        </defs>

        {/* actor headers + lifelines */}
        {actors.map((a) => {
          const x = xFor(a.id)
          const person = isPersonActor(a)
          return (
            <g key={a.id}>
              <rect x={x - 75} y={10} width={150} height={40} rx={person ? 20 : 8} fill={person ? '#1e293b' : '#f1f5f9'} stroke={person ? '#1e293b' : '#cbd5e1'} />
              <text x={x} y={35} textAnchor="middle" fontSize={13} fontWeight={600} fill={person ? '#fff' : '#1e293b'}>
                {a.label.length > 20 ? a.label.slice(0, 19) + '…' : a.label}
              </text>
              <line x1={x} y1={50} x2={x} y2={height - 10} stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 3" />
            </g>
          )
        })}

        {/* step arrows */}
        {steps.map((step, i) => {
          const y = TOP_PAD + i * ROW_HEIGHT
          const color = KIND_COLOR[step.kind]
          const selfLoop = step.from === step.to
          const x1 = xFor(step.from)
          const x2 = xFor(step.to)
          const drillable = !!step.detail
          const selected = selectedSeq === step.seq

          return (
            <g key={step.seq} onClick={drillable ? () => onStepClick(step.seq) : undefined} style={{ cursor: drillable ? 'pointer' : 'default' }}>
              <rect
                x={0}
                y={y - ROW_HEIGHT / 2 + 6}
                width={width}
                height={ROW_HEIGHT - 4}
                fill={selected ? 'rgba(37,99,235,0.08)' : 'transparent'}
                stroke={selected ? '#2563eb' : 'none'}
                strokeDasharray="4 3"
                rx={6}
              />
              <circle cx={LEFT_PAD - 24} cy={y} r={11} fill="#fff" stroke={color} strokeWidth={1.5} />
              <text x={LEFT_PAD - 24} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>
                {step.seq}
              </text>

              {selfLoop ? (
                <>
                  <path
                    d={`M ${x1} ${y - 10} C ${x1 + LOOP_WIDTH} ${y - 10}, ${x1 + LOOP_WIDTH} ${y + 10}, ${x1 + 6} ${y + 10}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    markerEnd={`url(#arrow-${step.kind})`}
                  />
                  <text x={x1 + 14} y={y - 16} fontSize={12} fill="#111">
                    {step.label}
                  </text>
                </>
              ) : (
                <>
                  <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={2} markerEnd={`url(#arrow-${step.kind})`} />
                  <text x={(x1 + x2) / 2} y={y - 8} textAnchor="middle" fontSize={12} fill="#111">
                    {step.label.length > 42 ? step.label.slice(0, 41) + '…' : step.label}
                  </text>
                </>
              )}

              {drillable && (
                <text x={selfLoop ? x1 + LOOP_WIDTH + 8 : Math.max(x1, x2) + 14} y={y + 4} fontSize={11} fontWeight={700} fill="#2563eb">
                  ⓘ
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

const REQUIRED_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  yes: { label: 'Required', bg: '#fee2e2', fg: '#b91c1c' },
  submit: { label: 'Required to submit', bg: '#ffedd5', fg: '#c2410c' },
  conditional: { label: 'Conditional', bg: '#fef9c3', fg: '#a16207' },
  no: { label: 'Optional', bg: '#f1f5f9', fg: '#475569' },
}

function StepDetailPanel({ step, detail, onClose }: { step: FlowStep; detail: StepDetail; onClose: () => void }) {
  const code: React.CSSProperties = {
    display: 'block',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: 10,
    fontSize: 12,
    whiteSpace: 'pre',
    overflowX: 'auto',
  }
  return (
    <div style={{ marginTop: 14, border: '1px solid #2563eb', borderRadius: 10, background: '#fff', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ margin: 0 }}>
          Step {step.seq}: {step.label}
        </h3>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>
          ✕
        </button>
      </div>
      {detail.summary && <p style={{ color: '#475569', marginTop: 6 }}>{detail.summary}</p>}

      {detail.fields && detail.fields.length > 0 && (
        <>
          <h4 style={{ margin: '14px 0 6px' }}>Form fields</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  {['Field', 'Type', 'Mandatory?', 'Validation', 'Notes'].map((h) => (
                    <th key={h} style={{ border: '1px solid #e2e8f0', padding: '6px 10px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.fields.map((f) => {
                  const badge = REQUIRED_BADGE[f.required]
                  return (
                    <tr key={f.name}>
                      <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px', fontWeight: 600 }}>
                        {f.name}
                        {f.source && <div style={{ fontWeight: 400, fontSize: 11, color: '#94a3b8' }}>{f.source}</div>}
                      </td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px' }}>{f.type}</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px' }}>
                        <span style={{ background: badge.bg, color: badge.fg, borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px' }}>{f.validation ?? '—'}</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px' }}>{f.notes ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {detail.sql && detail.sql.length > 0 && (
        <>
          <h4 style={{ margin: '14px 0 6px' }}>SQL</h4>
          {detail.sql.map((q, i) => (
            <code key={i} style={{ ...code, marginBottom: 8 }}>
              {q}
            </code>
          ))}
        </>
      )}

      {detail.request && (
        <>
          <h4 style={{ margin: '14px 0 6px' }}>Request</h4>
          <code style={code}>{detail.request}</code>
        </>
      )}
      {detail.response && (
        <>
          <h4 style={{ margin: '14px 0 6px' }}>Response</h4>
          <code style={code}>{detail.response}</code>
        </>
      )}

      {detail.rules && detail.rules.length > 0 && (
        <>
          <h4 style={{ margin: '14px 0 6px' }}>Rules enforced at this step</h4>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
            {detail.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </>
      )}

      {detail.sources && detail.sources.length > 0 && (
        <p style={{ marginTop: 14, marginBottom: 0, fontSize: 11, color: '#94a3b8' }}>Derived from: {detail.sources.join(' · ')}</p>
      )}
    </div>
  )
}

export default function FeatureFlow() {
  const { systemId = '', featureId = '' } = useParams()
  const feature = featuresBySystem[systemId]?.find((f) => f.id === featureId)
  const flow = getFlow(systemId, featureId)
  const [selectedSeq, setSelectedSeq] = useState<number | null>(null)

  const selectedStep = flow?.steps.find((s) => s.seq === selectedSeq)

  const kindsUsed = useMemo(() => {
    if (!flow) return []
    const set = new Set<StepKind>()
    flow.steps.forEach((s) => set.add(s.kind))
    return (Object.keys(KIND_COLOR) as StepKind[]).filter((k) => set.has(k))
  }, [flow])

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <p>
        <Link to={`/system/${systemId}`}>&larr; Back to {systemId} feature map</Link>
      </p>
      <h1 style={{ marginBottom: 4 }}>{feature?.label ?? featureId} — sequence flow (L3)</h1>
      {feature && <p style={{ color: '#555', marginTop: 0 }}>{feature.description}</p>}

      {!flow && <p>No L3 flow built for this feature yet.</p>}

      {flow && (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '12px 0 16px', fontSize: 12 }}>
            {kindsUsed.map((k) => (
              <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 3, background: KIND_COLOR[k], display: 'inline-block', borderRadius: 2 }} />
                {KIND_LABEL[k]}
              </span>
            ))}
          </div>

          {flow.steps.some((s) => s.detail) && (
            <p style={{ fontSize: 12, color: '#2563eb', margin: '0 0 8px' }}>
              Steps marked <strong>ⓘ</strong> drill down further — click one to see its fields, SQL, payloads, and rules.
            </p>
          )}

          <SequenceDiagram flow={flow} selectedSeq={selectedSeq} onStepClick={(seq) => setSelectedSeq(seq === selectedSeq ? null : seq)} />

          {selectedStep?.detail && <StepDetailPanel step={selectedStep} detail={selectedStep.detail} onClose={() => setSelectedSeq(null)} />}

          <h3 style={{ marginTop: 28, marginBottom: 8 }}>Step-by-step detail</h3>
          <ol style={{ lineHeight: 1.9, paddingLeft: 20 }}>
            {flow.steps.map((step) => {
              const from = flow.actors.find((a) => a.id === step.from)?.label ?? step.from
              const to = flow.actors.find((a) => a.id === step.to)?.label ?? step.to
              return (
                <li
                  key={step.seq}
                  onClick={step.detail ? () => setSelectedSeq(step.seq === selectedSeq ? null : step.seq) : undefined}
                  style={step.detail ? { cursor: 'pointer' } : undefined}
                >
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: KIND_COLOR[step.kind], marginRight: 6 }} />
                  <strong>
                    {from} &rarr; {to}:
                  </strong>{' '}
                  {step.label}
                  {step.detail && (
                    <span style={{ color: '#2563eb', fontWeight: 700, marginLeft: 6 }} title="Click to drill down">
                      ⓘ
                    </span>
                  )}
                </li>
              )
            })}
          </ol>

          {flow.note && (
            <div style={{ marginTop: 16, padding: 14, background: '#fffbe6', border: '1px solid #f0e0a0', borderRadius: 8 }}>
              <strong>Business logic / caveats:</strong> {flow.note}
            </div>
          )}
        </>
      )}
    </div>
  )
}
