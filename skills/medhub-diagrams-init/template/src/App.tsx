import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SystemInteraction from './pages/SystemInteraction'
import FeatureMap from './pages/FeatureMap'
import FeatureFlow from './pages/FeatureFlow'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SystemInteraction />} />
        <Route path="/system/:systemId" element={<FeatureMap />} />
        <Route path="/system/:systemId/feature/:featureId" element={<FeatureFlow />} />
      </Routes>
    </BrowserRouter>
  )
}
