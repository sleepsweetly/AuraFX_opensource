# AuraFX UI Redesign Design Document

## Overview

Bu tasarım dokümanı AuraFX editörünün kullanıcı arayüzünü tamamen yeniden tasarlama sürecini detaylandırır. Mevcut panel sistemi yerine modern, tutarlı ve kullanıcı dostu bir arayüz oluşturulacaktır.

## Architecture

### Current State Analysis
- Mevcut paneller: LayersPanel, ModesPanel, CodePanel, ImportPanel, ActionRecordingPanel, etc.
- Mevcut layout: LeftToolbar, RightSidebar, TopCenterToolbar, BottomStatusBar
- 3D editör: Karışık tema, play mode, VR mode mevcut
- Action recording: Element çakışma sorunları

### Target Architecture
- **Unified Panel System**: Tüm paneller TopCenterToolbar/BottomStatusBar tarzında tasarlanacak
- **Theme Consistency**: 2D ve 3D editörler arasında tutarlı tema
- **Modular Design**: Her panel bağımsız, yeniden kullanılabilir component
- **State Management**: Zustand store'lar optimize edilecek

## Components and Interfaces

### 1. New Panel System Design

#### Modern Panel Structure
```typescript
interface ModernPanel {
  id: string
  title: string
  icon: LucideIcon
  position: 'top' | 'bottom' | 'left' | 'right'
  collapsible: boolean
  resizable: boolean
  defaultSize: { width?: number; height?: number }
  content: React.ComponentType
  theme: 'white-modern'
}
```

#### White Modern Design Principles
- **Minimalist**: Clean white backgrounds, subtle borders
- **Typography**: Inter font family, clear hierarchy
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle drop shadows for depth
- **Borders**: 1px solid borders with rounded corners (4px radius)

#### Panel Layout Manager
- **TopBar**: Ana toolbar, Lucide iconları ile hızlı erişim butonları
- **BottomBar**: Status bilgileri, progress göstergeleri, beyaz modern tasarım
- **SidePanel**: Katmanlar, ayarlar (collapsible), Lucide iconları
- **FloatingPanels**: Kod editörü, import paneli (draggable), beyaz arka plan

### 2. 3D Editor White Theme

#### White Modern Theme Configuration
```typescript
interface ThemeConfig {
  background: '#ffffff'
  surface: '#fafafa'
  primary: '#000000'
  secondary: '#6b7280'
  accent: '#3b82f6'
  border: '#e5e7eb'
  text: '#111827'
  textSecondary: '#6b7280'
  hover: '#f3f4f6'
  active: '#e5e7eb'
}
```

#### Icon System
- **Icon Library**: Lucide React only
- **Icon Sizes**: 16px (small), 20px (medium), 24px (large)
- **Icon Colors**: Inherit from text colors
- **No Emojis**: All UI elements use Lucide icons exclusively

#### Removed Features
- Play mode UI components
- VR mode buttons and controls
- Dark theme variants for 3D editor

### 3. Action Recording Fix

#### Conflict Resolution Strategy
- **Element Tracking**: Unique ID system for all elements
- **Timeline Management**: Separate timeline for pre-existing vs recorded elements
- **State Isolation**: Recording state isolated from main element state
- **Conflict Detection**: Real-time conflict detection and resolution

## Data Models

### Panel State Model
```typescript
interface PanelState {
  panels: ModernPanel[]
  layout: LayoutConfig
  activePanel: string | null
  collapsedPanels: string[]
}
```

### Action Recording Model  
```typescript
interface ActionRecording {
  id: string
  timestamp: number
  elementIds: string[]
  action: ActionType
  data: any
  conflicts: ConflictInfo[]
}
```

## Error Handling

### Panel System Errors
- Panel loading failures → Fallback to minimal UI
- Layout corruption → Reset to default layout
- State sync issues → Auto-recovery mechanism

### 3D Editor Errors
- Theme loading failures → Fallback to system theme
- Render errors → Error boundary with recovery options

### Action Recording Errors
- Conflict detection → User notification with resolution options
- Timeline corruption → Backup and restore mechanism
- Performance issues → Automatic optimization

## Testing Strategy

### Unit Tests
- Panel component rendering
- Theme switching functionality
- Action recording conflict resolution
- State management operations

### Integration Tests
- Panel layout system
- 3D editor theme consistency
- Cross-editor navigation
- Performance benchmarks

### User Acceptance Tests
- UI/UX flow testing
- Accessibility compliance
- Cross-browser compatibility
- Mobile responsiveness