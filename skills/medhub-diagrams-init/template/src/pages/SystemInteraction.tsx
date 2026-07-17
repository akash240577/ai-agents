import { useMemo, useCallback, useState } from 'react'
import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useNavigate } from 'react-router-dom'
import { systemNodes, systemEdges, type SystemNode, type SystemKind } from '../data/systems'

const KIND_STYLE: Record<SystemKind, { label: string; bg: string; fg: string; border: string }> = {
  monolith: { label: 'monolith', bg: '#e0e7ff', fg: '#3730a3', border: '#4f46e5' },
  sibling: { label: 'sibling service', bg: '#dcfce7', fg: '#15803d', border: '#22c55e' },
  datastore: { label: 'datastore', bg: '#fef9c3', fg: '#a16207', border: '#eab308' },
  external: { label: 'external', bg: '#f1f5f9', fg: '#475569', border: '#94a3b8' },
}

function badge(text: string, bg: string, fg: string) {
  return (
    <span
      key={text}
      style={{ background: bg, color: fg, borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}
    >
      {text}
    </span>
  )
}

function nodeLabel(n: SystemNode) {
  const k = KIND_STYLE[n.kind]
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{n.label}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>{badge(k.label, k.bg, k.fg)}</div>
    </div>
  )
}

function layout(nodes: SystemNode[], selectedId: string | null): Node[] {
  const perRow = 4
  return nodes.map((n, i) => {
    const k = KIND_STYLE[n.kind]
    return {
      id: n.id,
      position: { x: (i % perRow) * 270, y: Math.floor(i / perRow) * 170 },
      data: { label: nodeLabel(n) },
      initialWidth: 230,
      initialHeight: 60,
      style: {
        border: `2px solid ${k.border}`,
        outline: selectedId === n.id ? '3px solid #2563eb' : 'none',
        borderRadius: 8,
        padding: 8,
        width: 230,
        cursor: 'pointer',
        opacity: n.hasFeatureMap ? 1 : 0.9,
        background: '#fff',
        color: '#111',
      },
    }
  })
}

function Legend() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10,
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #e2e2e2',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        lineHeight: 1.9,
        maxWidth: 260,
      }}
    >
      <strong>MedHub — System Interaction (L1)</strong>
      {(Object.keys(KIND_STYLE) as SystemKind[]).map((k) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 16, height: 10, border: `2px solid ${KIND_STYLE[k].border}`, borderRadius: 3 }} /> {KIND_STYLE[k].label}
        </div>
      ))}
      <div style={{ color: '#64748b' }}>Click the monolith to open its feature map.</div>
    </div>
  )
}

function DetailPanel({ system, onClose }: { system: SystemNode; onClose: () => void }) {
  const navigate = useNavigate()
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        width: 320,
        background: '#fff',
        border: '1px solid #2563eb',
        borderRadius: 10,
        padding: 16,
        fontSize: 13,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>{system.label}</h3>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>
          ✕
        </button>
      </div>
      <p style={{ color: '#475569', margin: '6px 0 10px' }}>{system.description}</p>
      {system.hasFeatureMap ? (
        <button
          onClick={() => navigate(`/system/${system.id}`)}
          style={{
            marginTop: 4,
            width: '100%',
            padding: '8px 0',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Open feature map →
        </button>
      ) : (
        <p style={{ marginTop: 4, marginBottom: 0, fontSize: 12, color: '#94a3b8' }}>
          External boundary — no feature map. It appears here because a documented feature calls it.
        </p>
      )}
    </div>
  )
}

export default function SystemInteraction() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const nodes = useMemo(() => layout(systemNodes, selectedId), [selectedId])
  const edges = useMemo<Edge[]>(
    () => systemEdges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: e.label, animated: false })),
    [],
  )

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedId((cur) => (cur === node.id ? null : node.id))
  }, [])

  const selected = systemNodes.find((s) => s.id === selectedId)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Legend />
      {selected && <DetailPanel system={selected} onClose={() => setSelectedId(null)} />}
      <ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick} onPaneClick={() => setSelectedId(null)} fitView>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
