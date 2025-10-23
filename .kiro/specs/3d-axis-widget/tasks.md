# Implementation Plan

- [x] 1. Create 3D Axis Widget Foundation

  - Create new `AxisWidget3D` component with separate Canvas viewport
  - Implement basic 3D axis meshes (X, Y, Z with cylinders and cones)
  - Set up corner positioning with responsive sizing
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 1.1 Create AxisWidget3D component structure


  - Create `app/3d/components/AxisWidget3D.tsx` file
  - Implement basic component with Canvas and viewport setup
  - Add corner positioning (top-right by default)
  - _Requirements: 1.1, 1.7_

- [x] 1.2 Implement 3D axis meshes


  - Create X axis (red) with cylinder shaft and cone arrow head
  - Create Y axis (green) with cylinder shaft and cone arrow head  
  - Create Z axis (blue) with cylinder shaft and cone arrow head
  - Add center sphere as origin point
  - _Requirements: 1.3_

- [x] 1.3 Add text labels for axes


  - Use drei/Text component for X, Y, Z labels
  - Position labels at the end of each axis
  - Match label colors with axis colors
  - _Requirements: 1.3_

- [x] 2. Implement camera synchronization

  - Create hook to track main camera orientation
  - Sync widget camera with main camera direction
  - Maintain fixed widget camera position for consistent view
  - _Requirements: 6.1, 6.2_

- [x] 2.1 Create useMainCameraOrientation hook


  - Track main camera position and target from use3DStore
  - Calculate camera direction vector
  - Update widget camera orientation in real-time
  - _Requirements: 6.1, 6.2_


- [x] 2.2 Implement smooth camera updates

  - Add frame-based camera synchronization using useFrame
  - Ensure minimal performance impact during updates
  - Handle edge cases when main camera data is unavailable
  - _Requirements: 6.3, 6.4_

- [x] 3. Add click detection and interaction

  - Implement raycasting for axis click detection
  - Handle mouse events within widget viewport
  - Add hover effects with material color changes
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.1 Set up raycasting system

  - Create raycaster for widget viewport
  - Convert mouse coordinates to widget-relative coordinates
  - Detect intersections with axis meshes
  - _Requirements: 3.1, 3.2_

- [x] 3.2 Implement hover effects

  - Change material colors on mouse hover
  - Add cursor pointer styling for interactive elements
  - Restore original colors when mouse leaves
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 3.3 Handle axis click events

  - Determine which axis was clicked (X, Y, or Z)
  - Trigger camera animation to selected axis view
  - Support both positive and negative axis directions
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Create camera animation system

  - Implement smooth camera transitions to axis views
  - Add configurable animation duration and easing


  - Support animation cancellation for rapid clicks
  - _Requirements: 2.4, 2.5, 2.7_

- [x] 4.1 Create CameraAnimator utility

  - Create `app/3d/utils/cameraAnimator.ts` file
  - Implement smooth interpolation between camera positions
  - Add easing functions for natural movement
  - _Requirements: 2.4_

- [x] 4.2 Implement axis positioning logic

  - Define standard camera positions for each axis (X, Y, Z)
  - Calculate appropriate camera distance from scene center
  - Ensure camera always looks at scene origin (0, 0, 0)
  - _Requirements: 2.1, 2.2, 2.3, 2.7_

- [x] 4.3 Add animation controls

  - Support animation cancellation when new axis is clicked
  - Track animation state to prevent conflicts
  - Integrate with use3DStore.updateCamera function
  - _Requirements: 2.5, 2.6_

- [x] 5. Integrate with existing scenes


  - Add AxisWidget3D to Scene3DEditor component
  - Add AxisWidget3D to OptimizedScene3D component
  - Ensure compatibility with existing camera controls
  - _Requirements: 1.5, 1.6_

- [x] 5.1 Update Scene3DEditor integration


  - Import and add AxisWidget3D component
  - Position widget in top-right corner
  - Ensure no conflicts with existing UI elements
  - _Requirements: 1.6_



- [x] 5.2 Update OptimizedScene3D integration

  - Import and add AxisWidget3D component
  - Maintain consistent positioning and behavior
  - Test performance impact in optimized mode
  - _Requirements: 1.6_

- [x] 5.3 Test compatibility with BlenderCameraControls


  - Verify widget works alongside existing camera controls
  - Ensure no event conflicts or interference
  - Test smooth interaction between manual and widget-based camera movement
  - _Requirements: 1.5_

- [x] 6. Add responsive design and polish

  - Implement responsive widget sizing for different screen sizes
  - Add error handling and graceful degradation
  - Optimize performance for smooth real-time updates
  - _Requirements: 5.1, 5.2, 5.3, 4.1, 4.2, 4.3_

- [x] 6.1 Implement responsive sizing

  - Define breakpoints for different screen sizes
  - Scale widget size appropriately (72px, 60px, 48px)
  - Adjust positioning to avoid UI conflicts
  - _Requirements: 5.1, 5.3_

- [x] 6.2 Add error handling

  - Wrap component in error boundary
  - Handle cases where 3D context is unavailable
  - Provide fallback behavior for animation failures
  - _Requirements: 4.2, 4.3_

- [ ]* 6.3 Performance optimization
  - Minimize re-renders during camera synchronization
  - Optimize raycasting calculations
  - Add performance monitoring for animation smoothness
  - _Requirements: 4.1, 6.3_

- [ ]* 6.4 Add comprehensive testing
  - Write unit tests for AxisWidget3D component
  - Test camera animation accuracy and timing
  - Verify click detection precision
  - _Requirements: All requirements_