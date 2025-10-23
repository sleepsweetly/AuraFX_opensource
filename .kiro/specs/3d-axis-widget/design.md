# Design Document

## Overview

Bu tasarım, mevcut `Scene3DEditor.tsx` dosyasındaki yorum satırında bulunan `BlenderAxisGizmo` komponentini temel alarak geliştirilmiş bir 3D axis widget sistemi oluşturacaktır. Widget, Blender'daki axis gizmo'ya benzer şekilde çalışacak ve kullanıcıların hızlı kamera navigasyonu yapmasını sağlayacaktır.

## Architecture

### Component Structure

```
AxisWidget (Ana Komponent)
├── AxisGizmo (3d olcak.
├── CameraAnimator (Kamera geçiş animasyonları)
└── AxisClickHandler (Tıklama olayları yönetimi)
```

### Integration Points

- **Scene3DEditor.tsx**: Ana entegrasyon noktası, mevcut yorum satırındaki kod geliştirilecek
- **OptimizedScene3D.tsx**: Aynı widget'ın eklenmesi
- **use3DStore.ts**: Kamera durumu yönetimi için mevcut `updateCamera` fonksiyonu
- **BlenderCameraControls.tsx**: Kamera kontrolü ile uyumluluk

## Components and Interfaces

### 1. AxisWidget Component

**Konum**: `app/3d/components/AxisWidget.tsx`

```typescript
interface AxisWidgetProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  size?: number
  onAxisClick?: (axis: 'x' | 'y' | 'z', direction: 'positive' | 'negative') => void
  showLabels?: boolean
  animated?: boolean
}

interface AxisState {
  x: Vector3
  y: Vector3  
  z: Vector3
  cameraPosition: Vector3
  cameraTarget: Vector3
}
```

**3D Implementation Details**:
- Separate mini 3D scene in corner viewport
- Independent camera that mirrors main camera orientation
- 3D axis meshes (cylinders + cones for arrows)
- Text labels using drei/Text component
- Raycasting for click detection
- Hover effects with material changes

**Mesh Structure**:
```typescript
// X Axis (Red)
<group>
  <mesh> {/* Cylinder shaft */}
    <cylinderGeometry args={[0.02, 0.02, 1]} />
    <meshBasicMaterial color="#ff4444" />
  </mesh>
  <mesh position={[0.6, 0, 0]}> {/* Arrow head */}
    <coneGeometry args={[0.05, 0.15]} />
    <meshBasicMaterial color="#ff4444" />
  </mesh>
  <Text position={[0.8, 0, 0]} color="#ff4444">X</Text>
</group>
```

### 2. CameraAnimator Service

**Konum**: `app/3d/utils/cameraAnimator.ts`

```typescript
interface CameraAnimationConfig {
  duration: number
  easing: 'linear' | 'ease-in-out' | 'ease-out'
  target: Vector3
  distance: number
}

class CameraAnimator {
  animateToAxis(axis: 'x' | 'y' | 'z', direction: 'positive' | 'negative'): Promise<void>
  cancelCurrentAnimation(): void
  isAnimating(): boolean
}
```

**Özellikler**:
- Smooth kamera geçişleri (500ms)
- Animasyon iptal etme
- Easing fonksiyonları
- Promise tabanlı API

### 3. AxisClickHandler

**Konum**: `app/3d/components/AxisWidget.tsx` içinde

```typescript
interface AxisClickConfig {
  axis: 'x' | 'y' | 'z'
  direction: 'positive' | 'negative'
  distance: number
  target: Vector3
}

const handleAxisClick = (config: AxisClickConfig) => {
  // Kamera pozisyonu hesaplama
  // Animasyon başlatma
  // Store güncelleme
}
```

## Data Models

### Camera State Integration

Mevcut `use3DStore` yapısını kullanacağız:

```typescript
// Mevcut interface - değişiklik yok
interface CameraState {
  position: Vector3
  target: Vector3
  isPerspective: boolean
}

// Yeni ekleme - axis widget durumu
interface AxisWidgetState {
  visible: boolean
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  size: number
  isAnimating: boolean
}
```

### Axis Directions

```typescript
const AXIS_POSITIONS = {
  x: {
    positive: { x: 10, y: 0, z: 0 },
    negative: { x: -10, y: 0, z: 0 }
  },
  y: {
    positive: { x: 0, y: 10, z: 0 },
    negative: { x: 0, y: -10, z: 0 }
  },
  z: {
    positive: { x: 0, y: 0, z: 10 },
    negative: { x: 0, y: 0, z: -10 }
  }
}

const TARGET_POSITION = { x: 0, y: 0, z: 0 } // Sahne merkezi
```

## Error Handling

### Animation Errors

```typescript
try {
  await cameraAnimator.animateToAxis('x', 'positive')
} catch (error) {
  console.warn('Camera animation failed:', error)
  // Fallback: Instant camera movement
  updateCamera({ position: targetPosition, target: TARGET_POSITION })
}
```

### Widget Rendering Errors

```typescript
const AxisWidget = () => {
  const [hasError, setHasError] = useState(false)
  
  if (hasError) {
    return null // Graceful degradation
  }
  
  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      {/* Widget content */}
    </ErrorBoundary>
  )
}
```

## Testing Strategy

### Unit Tests

1. **AxisWidget Component**
   - Render testi
   - Props validation
   - Click event handling
   - Hover states

2. **CameraAnimator**
   - Animation duration accuracy
   - Easing function correctness
   - Animation cancellation
   - Promise resolution/rejection

3. **Integration with Store**
   - Camera state updates
   - Store subscription handling
   - Performance impact measurement

### Integration Tests

1. **Scene Integration**
   - Widget visibility in both Scene3DEditor and OptimizedScene3D
   - Compatibility with BlenderCameraControls
   - No conflicts with existing UI elements

2. **User Interaction**
   - Click accuracy on small targets
   - Touch device compatibility
   - Keyboard accessibility (future)

### Performance Tests

1. **Rendering Performance**
   - Widget update frequency during camera movement
   - SVG rendering performance
   - Memory usage during animations

2. **Animation Performance**
   - 60fps maintenance during transitions
   - CPU usage during animations
   - Multiple rapid clicks handling

## Implementation Approach

### Phase 1: 3D Widget Foundation
1. Yeni `AxisWidget3D` komponenti oluştur (3D mesh tabanlı)
2. Corner viewport setup (separate Canvas)
3. Temel 3D axis meshes (X, Y, Z with cylinders and cones)
4. Independent camera that mirrors main camera orientation

### Phase 2: Interaction & Animation
1. Raycasting ile click detection
2. Smooth kamera geçişleri
3. Hover effects (material color changes)
4. Text labels with drei/Text

### Phase 3: Integration & Polish
1. `Scene3DEditor.tsx` ve `OptimizedScene3D.tsx`'e entegre et
2. Performance optimizasyonları
3. Responsive viewport sizing
4. Error handling ve graceful degradation

## Technical Decisions

### SVG vs 3D Rendering
**Karar**: 3D rendering kullanılacak
**Sebep**: 
- Profesyonel görünüm
- Gerçek 3D axis representation
- Kamera yönelimine göre gerçekçi görünüm
- Blender benzeri deneyim

### Animation Library
**Karar**: Custom animation implementation
**Sebep**:
- Minimal dependency
- Three.js ile doğrudan entegrasyon
- Mevcut store pattern ile uyumluluk

### Positioning Strategy
**Karar**: 3D viewport overlay with separate camera
**Sebep**:
- Gerçek 3D görünüm
- Kamera yönelimine göre otomatik güncelleme
- Profesyonel Blender benzeri deneyim
- Depth ve perspective doğru görünüm

### Store Integration
**Karar**: Mevcut `use3DStore` kullanılacak
**Sebep**:
- Tutarlılık
- Mevcut `updateCamera` fonksiyonu
- Minimal değişiklik

## Responsive Design

### Breakpoints
- **Large screens (>1200px)**: Full size widget (72x72px)
- **Medium screens (800-1200px)**: Medium size widget (60x60px)  
- **Small screens (<800px)**: Small size widget (48x48px)

### Touch Devices
- Minimum touch target: 44x44px
- Increased padding for touch areas
- Touch feedback animations

## Accessibility

### Future Considerations
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode support
- Reduced motion preferences
#
# 3D Widget Architecture

### Viewport Structure

```typescript
// Corner viewport with separate Canvas
<div className="absolute top-4 right-4 w-24 h-24 border border-gray-600 rounded-lg overflow-hidden">
  <Canvas
    camera={{ position: [2, 2, 2], fov: 50 }}
    gl={{ alpha: true, antialias: true }}
    style={{ background: 'rgba(0,0,0,0.3)' }}
  >
    <AxisWidget3D />
  </Canvas>
</div>
```

### 3D Axis Meshes

```typescript
const AxisWidget3D = () => {
  const mainCamera = useMainCameraOrientation() // Hook to get main camera
  
  return (
    <group>
      {/* X Axis - Red */}
      <group rotation={[0, 0, -Math.PI/2]}>
        <mesh position={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
        <mesh position={[0.9, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
          <coneGeometry args={[0.05, 0.15]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
        <Text position={[1.1, 0, 0]} fontSize={0.15} color="#ff4444">X</Text>
      </group>
      
      {/* Y Axis - Green */}
      <group>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8]} />
          <meshBasicMaterial color="#44ff44" />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <coneGeometry args={[0.05, 0.15]} />
          <meshBasicMaterial color="#44ff44" />
        </mesh>
        <Text position={[0, 1.1, 0]} fontSize={0.15} color="#44ff44">Y</Text>
      </group>
      
      {/* Z Axis - Blue */}
      <group rotation={[Math.PI/2, 0, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8]} />
          <meshBasicMaterial color="#4444ff" />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <coneGeometry args={[0.05, 0.15]} />
          <meshBasicMaterial color="#4444ff" />
        </mesh>
        <Text position={[0, 1.1, 0]} fontSize={0.15} color="#4444ff">Z</Text>
      </group>
      
      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[0.08]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}
```

### Camera Synchronization

```typescript
const useMainCameraOrientation = () => {
  const { camera } = use3DStore()
  const widgetCameraRef = useRef()
  
  useFrame(() => {
    if (widgetCameraRef.current) {
      // Widget kamerası ana kameranın yönelimini takip eder
      // Ama pozisyonu sabit kalır (2, 2, 2)
      const mainCameraDirection = new Vector3()
      // Ana kameradan yön al ve widget kamerasına uygula
      widgetCameraRef.current.lookAt(0, 0, 0)
    }
  })
  
  return widgetCameraRef
}
```

### Click Detection with Raycasting

```typescript
const handleAxisClick = (event) => {
  const raycaster = new Raycaster()
  const mouse = new Vector2()
  
  // Mouse pozisyonunu widget viewport'una göre normalize et
  mouse.x = (event.clientX / widgetWidth) * 2 - 1
  mouse.y = -(event.clientY / widgetHeight) * 2 + 1
  
  raycaster.setFromCamera(mouse, widgetCamera)
  const intersects = raycaster.intersectObjects(axisMeshes)
  
  if (intersects.length > 0) {
    const clickedAxis = getAxisFromMesh(intersects[0].object)
    animateToAxis(clickedAxis)
  }
}
```