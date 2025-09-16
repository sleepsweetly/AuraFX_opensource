export interface ArticleSection {
  id: string
  title: string
  paragraphs: string[]
}

export interface ArticleMeta {
  slug: string
  title: string
  description: string
  category: string
  version?: string
  lastUpdated?: string
  tags?: string[]
}

export interface Article extends ArticleMeta {
  sections: ArticleSection[]
}

const articles: Article[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Quick start with AuraFX: projects, canvas, and core concepts.',
    category: 'Introduction',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['intro', 'basics', 'setup'],
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        paragraphs: [
          'AuraFX is a professional-grade particle effect editor specifically designed for MythicMobs integration, offering an intuitive visual interface for creating complex particle animations. The editor combines real-time 2D canvas editing with advanced 3D preview capabilities, allowing creators to design effects through direct manipulation while maintaining precise control over particle behavior, timing, and spatial relationships. Built with performance in mind, AuraFX handles thousands of particles efficiently through optimized rendering pipelines and intelligent level-of-detail systems.',
          'The foundation is deliberately simple yet powerful, designed to handle complex particle systems efficiently. Layers group related elements and centralize parameters such as particle type, color, alpha, size, and repeat settings. Animation modes apply time-based motion globally or per layer and can be chained for complex sequences. The state store uses optimized data structures including maps for O(1) lookups, efficient vertex storage systems, and intelligent caching mechanisms. The history system captures compact snapshots that preserve the complete state while minimizing memory usage.',
        ],
      },
      {
        id: 'project-structure',
        title: 'Project Structure',
        paragraphs: [
          'A project is a portable description of your scene. It includes every vertex and shape with absolute positions, the list of layers and their visibility, all layer settings such as color, alpha, particle type, size and repeat, and any active animation modes. Camera and scene preferences for the 3D view are saved as well so reviewers see the same framing when opening a file.',
          'Saving to JSON is intentionally straightforward. The file mirrors the in memory structure so it can be inspected or edited by hand if necessary. You can keep a repository of project files for presets or tutorials, or hand off a project to an artist who does not need access to the rest of the codebase.',
        ],
      },
      {
        id: 'next-steps',
        title: 'Next Steps',
        paragraphs: [
          'After you understand the basics of a project, move to the canvas and learn how to navigate quickly with zoom and pan. Practice the core tools by blocking out shapes, then refine density and spacing until the silhouette reads well. When structure is solid, promote groups of points into layers to centralize parameters, and explore animation modes to add motion. For production workflows, study the image and OBJ importers, which let you bootstrap scenes from reference material.',
        ],
      },
    ],
  },
  {
    slug: 'canvas-tools',
    title: 'Canvas & Drawing Tools',
    description: 'Advanced navigation, modern drawing tools, and intelligent selection systems.',
    category: 'Basics',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['canvas', 'tools', 'drawing', 'selection'],
    sections: [
      { id: 'navigation', title: 'Navigation System', paragraphs: [
        'The navigation system provides smooth, responsive controls that scale from simple effects to complex scenes with thousands of elements. Use mouse wheel or trackpad pinch to zoom smoothly toward the cursor position, maintaining spatial context during detailed editing work. Hold the middle mouse button to pan the view without changing zoom level, allowing for precise positioning and exploration of large scenes.',
        'Advanced navigation features include viewport synchronization between 2D and 3D views, intelligent zoom limits, and context-sensitive navigation that adapts to the current tool and selection state. The system provides navigation history, allowing creators to quickly return to previously visited areas, and includes performance optimizations that maintain smooth interaction even with complex scenes.'
      ] },
      { id: 'tools', title: 'Drawing Tools', paragraphs: [
        'The comprehensive tool palette features a modern, streamlined interface with intelligent tool selection and context-sensitive controls. The Select tool provides intuitive manipulation with visual handles for transforms, multi-select capabilities, and intelligent selection modes that adapt to the current context. The Free tool allows for organic, hand-drawn particle placement with pressure sensitivity support and intelligent stroke smoothing.',
        'Parametric tools including Circle, Square, and Line create mathematically precise distributions with real-time parameter adjustment and dynamic particle count controls. The Eraser tool provides sophisticated cleanup capabilities with selective erasing modes and intelligent boundary detection. Advanced features include tool presets, customizable shortcuts, and intelligent tool switching.'
      ] },
      { id: 'selection', title: 'Selection System', paragraphs: [
        'The advanced selection system provides multiple selection modes and intelligent algorithms that adapt to different content types. Box selection allows for precise rectangular selection with visual feedback, while lasso selection provides organic selection shapes. Multi-selection capabilities include additive selection with Ctrl/Cmd modifiers and intelligent selection grouping.',
        'Advanced features include proximity-based selection, layer-aware selection that respects boundaries and visibility states, and intelligent selection expansion based on visual similarity or spatial relationships. The system provides selection analytics and optimization suggestions for working efficiently with large numbers of selected elements.'
      ] }
    ],
  },
  {
    slug: 'layers',
    title: 'Layer System',
    description: 'Advanced layer management with element settings and sophisticated particle distribution.',
    category: 'Basics',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['layers', 'settings', 'elements', 'organization'],
    sections: [
      { id: 'basics', title: 'Layer Management', paragraphs: [
        'The layer system serves as the primary organizational structure for managing complex particle effects efficiently. Layers group related elements into logical units, define consistent visual identities through shared parameters, and provide the fundamental building blocks for creating sophisticated multi-layered animations. Each layer can contain unlimited particles while maintaining consistent properties.',
        'Advanced layer features include layer-specific animation modes, independent timing controls, and sophisticated visibility management. The system provides layer templates, batch operations, and intelligent layer organization tools that help creators maintain clean, manageable project structures even in complex collaborative environments.'
      ] },
      { id: 'element-settings', title: 'Element Settings', paragraphs: [
        'The Element Settings system provides comprehensive control over individual particle properties and layer-wide parameters through an intuitive interface that adapts to the current selection and layer type. The modern Element Settings Panel features intelligent property grouping, real-time preview updates, and context-sensitive controls.',
        'Layer-wide settings include particle type selection with preview capabilities, color management with support for both solid colors and gradient systems, alpha controls with curve-based transparency profiles, and size parameters. The system includes intelligent parameter linking, parameter animation capabilities, and parameter presets for consistent styling across projects.'
      ] },
      { id: 'types', title: 'Layer Types', paragraphs: [
        'AuraFX provides a comprehensive suite of specialized layer types, each designed to generate particles using sophisticated mathematical formulas optimized for specific visual effects. The Basic type offers complete manual control, while geometric types include Circle, Ring, Square, and Line types that create precise distributions with configurable parameters.',
        'Advanced procedural types include Sphere type that generates evenly distributed particles using golden ratio methods and Fibonacci spirals, Helix types that create dynamic spiral patterns, and Orbital types that generate complex orbital patterns. Each layer type includes real-time parameter controls and optimization features that ensure smooth performance.'
      ] }
    ],
  },
  {
    slug: 'modes',
    title: 'Animation & Logic Modes',
    description: 'Global, layer-specific, and particle modes with advanced timing controls.',
    category: 'Basics',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['modes', 'animation', 'logic', 'timing'],
    sections: [
      { id: 'global', title: 'Global Animation Modes', paragraphs: [
        'Global animation modes operate on the entire scene simultaneously, providing the foundation for creating dynamic, engaging particle effects. The Rotate mode can spin the entire scene with configurable speed and direction, frequently combined with per-layer offsets to create sophisticated parallax effects. The Rainbow mode cycles through the color spectrum, offering both animated rainbow effects and static rainbow modes.',
        'Advanced global modes include Proximity mode for creating chained particle effects where particles activate in sequence based on spatial relationships, and Performance mode which intelligently optimizes rendering and animation calculations. Because global modes are non-destructive and can be toggled instantly, you can evaluate different design approaches without committing to baked motion.'
      ] },
      { id: 'local', title: 'Local Animation Modes', paragraphs: [
        'Local animation modes provide targeted control over specific layers or selected elements, enabling complex, multi-layered animation sequences. The Local Rotate mode allows individual particles to rotate around their own centers while participating in global rotation effects, creating complex orbital and spinning patterns.',
        'Layer-specific animation controls enable creators to apply different animation behaviors to different layers simultaneously, creating sophisticated composite effects. Advanced features include particle-specific behaviors, animation chaining and sequencing, allowing creators to define complex timing relationships between different animation elements.'
      ] },
      { id: 'timing', title: 'Timing & Sequencing', paragraphs: [
        'The timing system provides sophisticated control over animation pacing, sequencing, and synchronization. Frame-based timing controls, integrated into the Code Generation system, allow for precise control over animation duration and smoothness, with both automatic frame calculation and manual frame specification.',
        'Proximity-based sequencing creates chain reaction effects where particles activate in spatial order, creating wave-like propagation patterns. Advanced timing features include animation period controls, synchronization options, and intelligent timing optimization that automatically adjusts frame rates and update frequencies.'
      ] }
    ],
  }, 
 {
    slug: 'export-code-generation',
    title: 'Export & Code Generation',
    description: 'Generate MythicMobs YAML code with advanced frame settings and optimization features.',
    category: 'Workflows',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['export', 'code', 'mythicmobs', 'yaml'],
    sections: [
      { id: 'overview', title: 'Code Generation Overview', paragraphs: [
        'The Code Generation system transforms your visual particle effects into clean, optimized MythicMobs YAML code that can be directly integrated into your server. The system intelligently converts layer structures, animation modes, and particle arrangements into efficient skill configurations while maintaining the visual fidelity of your original design.',
        'The export process is highly configurable, offering multiple optimization levels and frame control options that allow creators to balance visual quality with server performance. Advanced features include MythicMobs Optimize mode for sphere-based effects, custom frame timing controls, and intelligent effect merging that reduces code complexity without sacrificing visual impact.',
        'Generated code follows MythicMobs best practices and includes comprehensive comments that make it easy to understand and modify later. The system preserves layer organization through code comments, maintains consistent naming conventions, and provides detailed metadata about the generation process.'
      ] },
      { id: 'frame-settings', title: 'Frame Settings', paragraphs: [
        'The modern Frame Settings system provides precise control over animation timing and sequencing, offering both automatic and manual frame calculation modes. The Auto mode intelligently calculates optimal frame counts based on animation periods, rotation speeds, and effect complexity, ensuring smooth motion while maintaining server performance.',
        'Manual mode gives creators complete control over frame timing, allowing for precise synchronization with music, game events, or other effects. The manual frame input includes intelligent validation that prevents performance issues while providing real-time feedback about the impact of different frame counts on both visual quality and server load.',
        'The frame settings system integrates seamlessly with all animation modes, automatically adjusting calculations for rotation, movement, color cycling, and complex multi-layer animations. The system also provides export previews that show frame-by-frame breakdowns, helping creators understand exactly how their animations will be executed.'
      ] },
      { id: 'mythicmobs-optimize', title: 'MythicMobs Optimize Mode', paragraphs: [
        'MythicMobs Optimize mode represents a breakthrough in particle effect optimization, specifically designed for sphere-based effects that can benefit from advanced mathematical optimization techniques. This mode analyzes circular and spherical particle arrangements and applies sophisticated algorithms to reduce code complexity while maintaining visual fidelity.',
        'The optimization engine uses advanced geometric analysis to identify patterns in particle placement and converts them into more efficient MythicMobs constructs such as particle rings, orbital patterns, and mathematical distributions. This approach not only reduces server load but also makes the generated code more readable and maintainable.',
        'Currently optimized for sphere and circle-based effects, the system includes intelligent fallback mechanisms that automatically detect when optimization is beneficial. The optimization process is completely transparent, with detailed logging and preview capabilities that allow creators to verify that optimized effects maintain their intended visual characteristics.'
      ] }
    ],
  },
  {
    slug: '3d-editor',
    title: '3D Editor & X-Ray Mode',
    description: 'Advanced 3D editing capabilities with X-Ray mode, vertex selection, and modern tools.',
    category: 'Advanced',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['3d', 'editor', 'xray', 'vertex', 'selection'],
    sections: [
      { id: 'overview', title: '3D Editor Overview', paragraphs: [
        'The 3D Editor provides a comprehensive three-dimensional workspace for creating and manipulating particle effects with full spatial awareness and advanced visualization capabilities. Unlike traditional 2D particle editors, the 3D environment allows creators to work with true volumetric effects, complex spatial relationships, and sophisticated camera movements.',
        'The 3D workspace features a modern, streamlined interface with context-sensitive toolbars, intelligent viewport management, and advanced rendering capabilities that provide real-time feedback on particle behavior and visual quality. Performance optimization features ensure smooth interaction even with complex scenes containing thousands of particles.',
        'Integration between the 3D editor and the main 2D system is seamless, allowing creators to move fluidly between different editing modes. Effects created in 3D can be exported to the 2D system for further refinement, while 2D designs can be imported into 3D for spatial enhancement and volumetric expansion.'
      ] },
      { id: 'xray-mode', title: 'X-Ray Mode & Advanced Selection', paragraphs: [
        'X-Ray Mode provides unprecedented visibility and control over complex particle arrangements by rendering all elements as wireframes with disabled depth testing. This mode allows creators to see through solid objects and dense particle clusters, making it possible to select and manipulate individual vertices that would otherwise be hidden behind other elements.',
        'The X-Ray selection system is specifically optimized for vertex-level editing, automatically switching to vertex-only selection mode when activated to prevent accidental shape selection and provide precise control over individual particles. This approach is particularly valuable when working with imported 3D models, dense particle clouds, or complex layered effects.',
        'Advanced X-Ray features include customizable visualization modes, selective transparency controls, and intelligent occlusion handling. The mode can be toggled instantly using the Alt+Z keyboard shortcut, allowing creators to switch rapidly between normal and X-Ray views during the editing process.'
      ] },
      { id: 'tools-interface', title: 'Modern Tools & Interface', paragraphs: [
        'The 3D editor features a completely redesigned toolbar system with modern Lucide icons, intelligent tool grouping, and context-sensitive controls that adapt to the current editing mode and selection state. The toolbar provides quick access to essential tools including Select (Q), Move (W), Rotate (E), and Scale (R), with visual feedback that clearly indicates the active tool.',
        'The interface design prioritizes efficiency and clarity, with carefully organized tool groups, consistent visual hierarchy, and responsive layout that adapts to different screen sizes and workspace configurations. Advanced interface features include customizable layouts, floating panels, and workspace presets that allow creators to optimize their environment for different types of tasks.',
        'Integration with the overall AuraFX ecosystem ensures consistent behavior and visual design across all editing modes, while specialized 3D features provide the additional functionality needed for spatial editing. The interface includes advanced features such as viewport gizmos, coordinate system indicators, and real-time performance monitoring.'
      ] }
    ],
  },  {
   
 slug: 'performance-optimization',
    title: 'Performance Optimization',
    description: 'Advanced performance analysis, optimization templates, and server-friendly effect creation.',
    category: 'Advanced',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['performance', 'optimization', 'templates', 'analysis'],
    sections: [
      { id: 'overview', title: 'Performance System Overview', paragraphs: [
        'The Performance Optimization system provides comprehensive tools for analyzing, optimizing, and managing the server impact of particle effects while maintaining visual quality and creative flexibility. The system uses advanced algorithms to analyze effect complexity, identify optimization opportunities, and provide actionable recommendations that help creators balance visual impact with server performance.',
        'The optimization engine employs multiple analysis techniques including particle density analysis, animation complexity assessment, and server load estimation to provide accurate performance predictions and optimization suggestions. Advanced features include batch optimization, template-based optimization, and intelligent effect merging that can significantly reduce server load.',
        'Performance optimization goes beyond simple particle count reduction, incorporating sophisticated techniques such as mathematical optimization, effect consolidation, and intelligent timing adjustments. The system provides detailed performance reports, optimization history tracking, and comparative analysis tools that help creators make data-driven decisions.'
      ] },
      { id: 'analysis-tools', title: 'Performance Analysis', paragraphs: [
        'The integrated performance analysis system provides real-time monitoring and detailed reporting on effect complexity, resource usage, and potential optimization opportunities. Visual indicators use color-coded status systems ranging from Excellent (green) for lightweight effects to Critical (red) for effects that may cause server performance issues.',
        'Advanced analysis features include trend analysis that tracks performance changes over time, comparative analysis that evaluates multiple effects simultaneously, and predictive modeling that estimates server impact under different load conditions. The system provides detailed breakdowns of performance bottlenecks, identifying specific layers or animation modes that contribute most significantly to resource usage.',
        'The analysis system includes intelligent threshold management that automatically adjusts performance recommendations based on server specifications, player count, and other environmental factors. Customizable performance profiles allow creators to optimize effects for different deployment scenarios.'
      ] },
      { id: 'templates', title: 'Optimization Templates', paragraphs: [
        'The template system provides a curated library of pre-optimized effects that demonstrate best practices for server-friendly particle effect creation while maintaining high visual quality. Templates are organized by complexity level and visual style, ranging from Simple Fire, Ice, and Lightning effects to more complex Epic Explosion, Magic Shield, and Spiral Vortex effects.',
        'Template effects are designed to be both educational and practical, serving as starting points for custom effects while demonstrating specific optimization techniques. The Simple templates focus on achieving maximum visual impact with minimal resource usage, while Complex templates demonstrate advanced techniques such as layered effects and mathematical optimization.',
        'The template system includes customization tools that allow creators to modify template effects while maintaining their optimization characteristics. Advanced features include template blending, parameter scaling, and optimization preservation that ensure customized effects retain the performance benefits of the original templates.'
      ] }
    ],
  },
  {
    slug: 'import-images',
    title: 'Importing Images (PNG)',
    description: 'Import PNG images with adjustable threshold/tolerance/size and max elements.',
    category: 'Workflows',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['import', 'png', 'images'],
    sections: [
      { id: 'settings', title: 'Import Settings', paragraphs: [
        'The PNG importer provides sophisticated controls that map directly to predictable visual changes, enabling creators to fine-tune the import process for optimal results. The Size parameter downsamples the image before analysis, effectively limiting the upper bound on the number of elements generated and providing crucial control for managing performance and visual complexity.',
        'The Threshold parameter determines where edges are detected or where regions are considered solid enough for sampling, allowing creators to control the level of detail captured from the source image. The Tolerance parameter groups similar colors together, preventing gradients and subtle color variations from exploding into excessive numbers of individual particles.',
        'The maximum elements setting acts as a guard rail that prevents pathological cases from degrading editor performance. For crisp logos and graphic designs, small size reductions combined with a relatively high threshold and low tolerance typically yield clean, well-defined shapes that maintain the original design intent.'
      ] },
      { id: 'preview', title: 'Preview & Optimization', paragraphs: [
        'The live preview system provides real-time feedback that allows creators to verify that the extraction process captures the essential visual elements of the source material before committing to the import. This preview functionality is crucial for achieving optimal results, as it enables iterative refinement of import settings until the desired outcome is achieved.',
        'When working with imported images, it is important to aim for capturing silhouettes and key inflection points rather than attempting to represent every pixel of the original image. This approach ensures that the resulting particle effect maintains the visual impact and recognizability of the source while being optimized for animation and performance.',
        'A common workflow involves importing a reference image, using it as a guide to create a simplified layer that reads better in motion, and then either hiding or deleting the reference layer once the simplified version achieves the desired effect. This approach ensures that the final particle effect is optimized for animation while maintaining the visual essence of the original source material.'
      ] }
    ],
  },
  {
    slug: 'obj-import',
    title: 'Importing OBJ',
    description: 'Import OBJ as vertex sets with scale/centering and grouping for selection.',
    category: 'Workflows',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['import', 'obj', '3d'],
    sections: [
      { id: 'scale', title: 'Scale & Center', paragraphs: [
        'The OBJ import system converts 3D model vertex coordinates into editor elements, providing a bridge between traditional 3D modeling workflows and particle effect creation. Many 3D authoring tools use different units and coordinate systems, so the importer intelligently applies a scale factor and recenters the model around the origin to ensure consistent behavior within the AuraFX environment.',
        'This automatic scaling and centering process is crucial for maintaining predictable behavior and intuitive interaction with imported 3D models. Keeping the pivot point at the origin ensures that rotations and transformations are intuitive and that transform gizmos align with user expectations, providing a consistent editing experience regardless of the original model coordinate system.',
        'The scale factor is particularly important when combining 3D imported content with existing 2D elements, as it helps maintain consistent world proportions and prevents the need for manual rescaling later in the creative pipeline. The importer includes advanced features such as automatic unit detection, intelligent bounding box calculation, and configurable import options.'
      ] },
      { id: 'grouping', title: 'Grouping & Selection', paragraphs: [
        'Imported OBJ models are automatically grouped as single entities, making it easy to select, transform, or delete the entire imported model as a cohesive unit. This grouping approach simplifies workflow management when working with complex models that may contain hundreds or thousands of vertices, as creators can manipulate the entire model without needing to select individual vertices.',
        'The grouping system maintains the internal structure and relationships of the imported model while providing high-level control over positioning, scaling, and rotation. Advanced grouping features include hierarchical selection, where creators can choose to work with the entire group or drill down to individual vertices when needed for detailed editing.',
        'The system also provides intelligent ungrouping options that allow creators to break apart imported models when they need to work with individual components or create variations based on specific parts of the original model. This flexibility ensures that imported content can be adapted and modified to meet specific creative requirements while maintaining the efficiency benefits of grouped manipulation.'
      ] }
    ],
  },  
{
    slug: 'history-undo-redo',
    title: 'History, Undo & Redo',
    description: 'How changes are tracked and how to step backward/forward safely.',
    category: 'Basics',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['history', 'undo', 'redo'],
    sections: [
      { id: 'tracking', title: 'Change Tracking', paragraphs: [
        'The history system records compact snapshots that include the vertices map, the shapes array, and layer definitions. This design avoids the usual pitfalls of patch-based histories where a missed edge case can corrupt the state. Because snapshots are already in a serialization-friendly format, saving to disk and undoing share much of the same code path, which keeps behavior consistent.',
        'The store also resets selections when restoring a snapshot to prevent accidental edits to items that may not exist in the previous state. The system employs intelligent change detection algorithms that identify only the modified data sets, allowing for efficient snapshot creation that rebuilds only the changed components rather than the entire scene state.'
      ] },
      { id: 'tips', title: 'Best Practices', paragraphs: [
        'Add structure before polishing. Establish the number of layers and their roles, then place elements broadly to determine scale and rhythm. Save a milestone when composition reads well. During refinement, prefer batch operations like per-layer color changes over micro edits to individuals.',
        'When experimenting with drastic changes, duplicate a layer instead of modifying the only copy so undo history stays clean and you can quickly A/B compare approaches. Because history snapshots are granular, committing after each meaningful step makes it easy to roll back just the portion you want without losing adjacent improvements.'
      ] }
    ],
  },
  {
    slug: 'settings',
    title: 'Settings & Preferences',
    description: 'Customize appearance, panel behavior, and editor preferences for optimal workflow.',
    category: 'Basics',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['settings', 'preferences', 'ui', 'panels'],
    sections: [
      { id: 'panel-system', title: 'Modern Panel System', paragraphs: [
        'The redesigned panel system features intelligent scroll management, optimized content display, and responsive layout that adapts to different screen sizes and workflow requirements. The new panel architecture eliminates common scrolling issues where content would be cut off at the bottom, ensuring that all panel content remains accessible regardless of panel size or content length.',
        'Panel layout management includes draggable panels, resizable containers, and intelligent docking that allows creators to customize their workspace for different types of tasks. The system remembers panel positions and sizes across sessions, ensuring that personalized workspace configurations remain consistent. Advanced panel features include collapsible sections, tabbed interfaces, and floating panels.',
        'The panel system includes accessibility features such as keyboard navigation, screen reader support, and customizable font sizes that ensure the interface remains usable across different devices and user preferences. Performance optimizations ensure that panel interactions remain smooth even with complex content.'
      ] },
      { id: 'notification-system', title: 'Toast Notification System', paragraphs: [
        'The modern toast notification system replaces traditional sidebar announcements with elegant, non-intrusive notifications that appear at the top-center of the interface. The notification system uses sophisticated visual design with gradient backgrounds, smooth animations, and intelligent positioning that ensures notifications are visible without blocking important interface elements.',
        'Notification types include system announcements, feature updates, performance warnings, and export confirmations, each with distinctive visual styling and appropriate urgency levels. The system uses modern design principles including glassmorphism effects, subtle animations, and responsive typography that maintains readability across different screen sizes.',
        'The notification system integrates seamlessly with the overall interface design, using consistent color schemes, typography, and animation patterns. Accessibility features ensure that notifications are compatible with screen readers and keyboard navigation, while performance optimizations prevent notification display from impacting editor responsiveness.'
      ] },
      { id: 'appearance', title: 'Appearance Customization', paragraphs: [
        'The appearance customization system provides comprehensive control over the visual aspects of the AuraFX interface, enabling creators to optimize their workspace for comfort, productivity, and personal preference. The dark theme system uses carefully calibrated color palettes that provide optimal contrast for particle effect creation while reducing eye strain during extended editing sessions.',
        'UI density options allow creators to optimize interface layout for their specific screen size and workflow requirements, with compact modes that maximize content visibility on smaller screens and relaxed modes that provide comfortable interaction targets on larger displays. Typography customization includes adjustable font sizes, font family selection, and line spacing controls.',
        'Visual customization extends to the canvas and 3D viewport, with options for grid appearance, background colors, and reference element styling that help creators optimize their workspace for different types of effects and personal preferences. The system also includes high-contrast modes and accessibility options that ensure the interface remains usable for creators with different visual requirements.'
      ] }
    ],
  },
  {
    slug: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Common shortcuts for editing, navigation, and panels.',
    category: 'Basics',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['shortcuts', 'productivity'],
    sections: [
      { id: 'editing', title: 'Editing Shortcuts', paragraphs: [
        'Core editing shortcuts mirror common creative tools: Undo (Ctrl+Z), Redo (Ctrl+Y), Copy (Ctrl+C), Paste (Ctrl+V) and Delete (Del). Combine these with Shift for multi-select and with drag selection to quickly gather groups of elements before moving or transforming them. When testing timing, it is typical to duplicate a layer, tweak density or color, and A/B swap visibility.',
        'For transforms, most users keep one hand on the keyboard to toggle between translate, rotate and scale modes while the other hand manipulates the gizmo. This rhythm is efficient and reduces pointer travel. When you need to cancel an operation cleanly, press Escape; the store discards the temporary buffer and restores positions to the last committed state.',
        'Clipboard operations preserve color and particle metadata so pasted elements remain visually consistent with their sources. If you paste into a new layer, the layer settings will then take precedence for parameters like color and alpha. Because history snapshots are granular, committing after each meaningful step makes it easy to roll back just the portion you want.'
      ] },
      { id: 'navigation', title: 'Navigation & View', paragraphs: [
        'Navigation shortcuts include zoom controls, view reset functionality, and quick camera positioning. The 3D editor includes specific shortcuts for tool selection: Select (Q), Move (W), Rotate (E), and Scale (R). The X-Ray mode can be toggled instantly using Alt+Z, allowing creators to switch rapidly between normal and X-Ray views during the editing process.',
        'Panel management shortcuts allow for quick workspace organization, including temporarily hiding panels for clean canvas views and restoring full interface layouts. These shortcuts are particularly helpful when presenting work or recording demonstrations, as they enable quick transitions between different interface configurations.',
        'View management includes shortcuts for framing selected elements, resetting camera positions, and switching between different viewport modes. The system provides consistent navigation behavior across both 2D and 3D editing environments, ensuring that muscle memory transfers seamlessly between different editing modes.'
      ] }
    ],
  },
  {
    slug: 'faq',
    title: 'FAQ',
    description: 'Frequently asked questions and troubleshooting tips.',
    category: 'Support',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['faq', 'help'],
    sections: [
      { id: 'common', title: 'Common Questions', paragraphs: [
        'If an image import appears too dense or too sparse, adjust Size first to bring the element count into a sensible range, then refine Threshold and Tolerance. For OBJ files that look misaligned after import, verify the model original unit scale and apply the importer scale factor so it matches the editor scene. Performance issues during editing are usually caused by extremely large vertex counts or multiple heavy previews—enable Performance Mode to simplify rendering while you iterate.',
        'When exporting to MythicMobs, remember that positions are offsets relative to the origin; if an effect appears shifted in game, check that your spawn location and orientation match the editor expectations. For visual glitches specific to a browser or GPU, disable any experimental graphics flags and ensure drivers are up to date. If a project fails to load, the console typically reports the first key it could not parse.',
        'In collaborative environments, prefer sharing exported JSON projects rather than screenshots so teammates can reproduce the issue precisely. When asking for help, include a short clip or GIF of the behavior, your project vertex count, and whether performance mode is enabled—these details allow others to respond accurately on the first attempt.'
      ] }
    ],
  },
  {
    slug: 'contact',
    title: 'Contact & Support',
    description: 'How to reach out for support, feedback, and contributions.',
    category: 'Support',
    version: 'v2.0',
    lastUpdated: '2025-08-10',
    tags: ['contact', 'support'],
    sections: [
      { id: 'channels', title: 'Support Channels', paragraphs: [
        'For support and feedback, prefer asynchronous channels so complex issues can be tracked properly. The Contact page routes your message to the maintainers and includes fields for environment details that save time during triage. If you are reporting a bug, attach the smallest project that reproduces the problem and note any browser console messages.',
        'For feature requests, explain the workflow you are trying to achieve rather than proposing a specific UI; this context helps us design solutions that integrate well with the rest of the editor. Community spaces are ideal for quick questions, tips and showcasing work. When sharing projects publicly, confirm that any assets you imported are yours to distribute.',
        'If you want to contribute fixes or documentation, open a pull request with a clear summary and before/after screenshots or clips. Small, focused changes are easiest to review. We appreciate reports that include performance metrics or comparative exports because they help validate improvements across machines and content types.'
      ] }
    ],
  }
]

export function listArticles(): ArticleMeta[] {
  return articles.map(({ sections, ...meta }) => meta)
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

export function listCategories(): { name: string; items: ArticleMeta[] }[] {
  const byCat = new Map<string, ArticleMeta[]>()
  listArticles().forEach((a) => {
    if (!byCat.has(a.category)) byCat.set(a.category, [])
    byCat.get(a.category)!.push(a)
  })
  return Array.from(byCat.entries()).map(([name, items]) => ({ name, items }))
}

export function searchArticles(query: string): ArticleMeta[] {
  const lower = query.trim().toLowerCase()
  if (!lower) return []
  return articles
    .filter((a) => {
      const haystack = [
        a.title,
        a.description,
        ...(a.tags || []),
        ...a.sections.flatMap((s) => [s.title, ...s.paragraphs]),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(lower)
    })
    .map(({ sections, ...meta }) => meta)
}