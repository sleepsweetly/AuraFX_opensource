import { Wrench, Zap, FolderOpen } from "lucide-react"

export function TestIcons() {
  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h2>Icon Test</h2>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Wrench size={24} />
        <Zap size={24} />
        <FolderOpen size={24} />
        <span>Bu ikonlar görünüyor mu?</span>
      </div>
    </div>
  )
}