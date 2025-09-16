// Transform Worker - Heavy calculations in background thread
interface TransformMessage {
  type: 'BATCH_TRANSFORM' | 'ROTATE_VERTICES' | 'SCALE_VERTICES'
  data: any
}

interface TransformResult {
  type: string
  vertices: Array<{id: string, position: {x: number, y: number, z: number}}>
  processingTime: number
}

// Matrix operations optimized for batch processing
class TransformProcessor {
  // Batch transform vertices - much faster than individual transforms
  static batchTransform(vertices: any[], transform: any): any[] {
    const startTime = performance.now()
    
    // Pre-calculate transformation matrix
    const cos = Math.cos(transform.rotation?.y || 0)
    const sin = Math.sin(transform.rotation?.y || 0)
    
    const results = vertices.map(vertex => {
      let { x, y, z } = vertex.position
      
      // Apply rotation (if needed)
      if (transform.rotation) {
        const newX = x * cos - z * sin
        const newZ = x * sin + z * cos
        x = newX
        z = newZ
      }
      
      // Apply scale
      if (transform.scale) {
        x *= transform.scale.x
        y *= transform.scale.y
        z *= transform.scale.z
      }
      
      // Apply translation
      if (transform.position) {
        x += transform.position.x
        y += transform.position.y
        z += transform.position.z
      }
      
      return {
        ...vertex,
        position: { x, y, z }
      }
    })
    
    return results
  }
  
  // Optimized rotation for large vertex sets
  static rotateVerticesAroundPoint(vertices: any[], center: any, angle: number): any[] {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    
    return vertices.map(vertex => {
      const x = vertex.position.x - center.x
      const z = vertex.position.z - center.z
      
      return {
        ...vertex,
        position: {
          x: center.x + (x * cos - z * sin),
          y: vertex.position.y,
          z: center.z + (x * sin + z * cos)
        }
      }
    })
  }
}

// Worker message handler
self.onmessage = (event: MessageEvent<TransformMessage>) => {
  const { type, data } = event.data
  const startTime = performance.now()
  
  let result: TransformResult
  
  switch (type) {
    case 'BATCH_TRANSFORM':
      const transformed = TransformProcessor.batchTransform(data.vertices, data.transform)
      result = {
        type: 'BATCH_TRANSFORM_COMPLETE',
        vertices: transformed,
        processingTime: performance.now() - startTime
      }
      break
      
    case 'ROTATE_VERTICES':
      const rotated = TransformProcessor.rotateVerticesAroundPoint(
        data.vertices, 
        data.center, 
        data.angle
      )
      result = {
        type: 'ROTATE_COMPLETE',
        vertices: rotated,
        processingTime: performance.now() - startTime
      }
      break
      
    default:
      result = {
        type: 'ERROR',
        vertices: [],
        processingTime: 0
      }
  }
  
  self.postMessage(result)
}

export {}