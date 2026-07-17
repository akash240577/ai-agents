import { useMemo, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { featuresBySystem, type FeatureNode } from '../data/features'
import { systemNodes } from '../data/systems'
import { getFlow } from '../data/flows'

function nodeLabel(f: FeatureNode, hasFlow: boolean) {
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontWeight: 600, fontSize: 13 }}>
        {f.label}
        {hasFlow && <span style={{ color: '#2563eb', marginLeft: 6, fontWeight: 700 }}>→</span>}
      </div>
      <div
        style={{
          fontSize: 11,
          color: '#64748b',
          marginTop: 3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {f.description}
      </div>
      {f.actors && f.actors.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
          {f.actors.map((a) => (
            <span
              key={a}
              style={{ background: '#f1f5f9', color: '#475569', borderRadius: 10, padding: '1px 7px', fontSize: 10, whiteSpace: 'nowrap' }}
            >
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function layout(systemId: string, features: FeatureNode[]): Node[] {
  const perRow = 4
  return features.map((f, i) => {
    const hasFlow = !!getFlow(systemId, f.id)
    return {
      id: f.id,
      position: { x: (i % perRow) * 300, y: Math.floor(i / perRow) * 200 },
      data: { label: nodeLabel(f, hasFlow) },
      initialWidth: 250,
      initialHeight: 90,
      style: {
        border: hasFlow ? '1px solid #888' : '1px dashed #bbb',
        borderRadius: 8,
        padding: 8,
        width: 250,
        cursor: hasFlow ? 'pointer' : 'default',
        opacity: hasFlow ? 1 : 0.7,
        background: '#fff',
        color: '#111',
      },
    }
  })
}

/** L2 edges: MedHub features are NOT isolated — a feature declares its outgoing
 *  `dependsOn` edges, and we draw each one whose target is also on this map. */
function buildEdges(features: FeatureNode[]): Edge[] {
  const ids = new Set(features.map((f) => f.id))
  const edges: Edge[] = []
  for (const f of features) {
    for (const dep of f.dependsOn ?? []) {
      if (!ids.has(dep.to)) continue
      edges.push({
        id: `${f.id}->${dep.to}`,
        source: f.id,
        target: dep.to,
        label: dep.label,
        animated: false,
        style: { stroke: '#9333ea' },
        labelStyle: { fontSize: 11 },
      })
    }
  }
  return edges
}

export default function FeatureMap() {
  const { systemId = '' } = useParams()
  const navigate = useNavigate()

  const system = systemNodes.find((s) => s.id === systemId)
  const features = featuresBySystem[systemId] ?? []

  const nodes = useMemo(() => layout(systemId, features), [systemId, features])
  const edges = useMemo(() => buildEdges(features), [features])

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      if (getFlow(systemId, node.id)) {
        navigate(`/system/${systemId}/feature/${node.id}`)
      }
    },
    [navigate, systemId],
  )

  if (features.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <p>
          <Link to="/">&larr; Back to System Interaction</Link>
        </p>
        <h1>{system?.label ?? systemId} — feature map</h1>
        <p>No features documented yet. Run the <code>medhub-diagram-feature</code> skill to add one.</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #ddd' }}>
        <Link to="/">&larr; Back to System Interaction</Link>
        <h2 style={{ margin: '4px 0' }}>{system?.label ?? systemId} — feature map (L2)</h2>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
