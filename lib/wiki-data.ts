
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
  // 1. Essentials
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Basic introduction to AuraFX.',
    category: 'Essentials',
    lastUpdated: '2024-03-20',
    version: '2.0.0',
    tags: ['basics', 'intro'],
    sections: [
      {
        id: 'what-is-aurafx',
        title: 'What is AuraFX?',
        paragraphs: [
          'AuraFX is a web-based particle effect editor designed for Minecraft. It allows you to draw shapes, apply effects, and generate code for MythicMobs, Vanilla Commands, or Datapacks.',
          'It runs entirely in your browser and supports real-time 3D visualization.'
        ]
      },
      {
        id: 'navigation',
        title: 'How do I navigate the canvas?',
        paragraphs: [
          '**Zoom**: Use the **Mouse Wheel** to zoom in and out.',
          '**Pan**: Hold Middle Mouse Button (or Space + Left Click) and drag.',
          '**3D Rotation**: Right-click drag or use Q, W, A, S keys in the 3D Editor.'
        ]
      },
      {
        id: 'getting-started-first-effect',
        title: 'Creating Your First Effect',
        paragraphs: [
          '1. Select a tool (Square, Circle, etc.) from the left toolbar.',
          '2. Click/Drag on the canvas to draw.',
          '3. Adjust properties (Color, Size) in the Right Sidebar.',
          '4. Press Space to Play/Pause.'
        ]
      }
    ]
  },
  {
    slug: 'tools',
    title: 'Tools & Shapes',
    description: 'Available drawing tools and shapes.',
    category: 'Essentials',
    lastUpdated: '2024-03-20',
    version: '2.0.0',
    tags: ['tools', 'shapes', 'drawing'],
    sections: [
      {
        id: 'tools-core',
        title: 'What tools are available?',
        paragraphs: [
          'The Left Toolbar provides essential drawing tools:',
          '- **Select (Cursor)**: Click to select objects. Drag to move them.',
          '- **Eraser**: Click an object to delete it.',
          '- **Shapes**: Circle, Square, Triangle, Line.',
          '- **Pencil**: Freehand drawing (creates points).'
        ]
      },
      {
        id: 'tools-shortcuts',
        title: 'Are there keyboard shortcuts?',
        paragraphs: [
          '**Currently, the 2D Editor is designed for mouse interaction only.**',
          'We plan to add keyboard shortcuts (e.g., B for Brush, E for Eraser) in future updates.',
          'For 3D navigation shortcuts, check the **3D Editor** section.'
        ]
      }
    ]
  },

  // 2. Effect Types
  {
    slug: 'effect-types',
    title: 'Effect Types',
    description: 'Understanding the different particle behaviors.',
    category: 'Effect Types',
    lastUpdated: '2024-03-20',
    version: '2.0.0',
    tags: ['effects', 'configuration'],
    sections: [
      {
        id: 'basics',
        title: 'How do I change the effect type?',
        paragraphs: [
          'Select an element on the canvas, then use the **Element Config** panel (Right Sidebar).',
          'Under "Effect Type", click one of the icons to switch behaviors. The default is **Basic Particles**.'
        ]
      },
      {
        id: 'tornado',
        title: 'How do I create a Tornado?',
        paragraphs: [
          'Select the **Particle Tornado** effect type. Unlike a simple spiral, this effect creates a dynamic vertex-based tornado.',
          '**Key Parameters:**',
          '- **Max Radius**: The width of the tornado at the top.',
          '- **Tornado Height**: How tall the tornado is.',
          '- **Cloud Particle**: The particle used for the "cloud" at the top of the tornado (e.g., `largeexplode`).',
          '- **Rotation Speed**: How fast the tornado spins.'
        ]
      },
      {
        id: 'helix',
        title: 'What is the Helix effect?',
        paragraphs: [
          'The **Particle Line Helix** creates a DNA-like spiral structure.',
          '**Key Parameters:**',
          '- **Helix Length**: The vertical length of one complete turn.',
          '- **Helix Radius**: The width of the spiral.',
          '- **Distance Between**: The density of particles along the spiral.'
        ]
      },
      {
        id: 'orbital',
        title: 'How does the Orbital effect work?',
        paragraphs: [
          'The **Particle Orbital** effect makes particles orbit around a central point.',
          'You can configure the **Radius**, **Angular Velocity**, and whether it rotates on the X, Y, or Z axis.'
        ]
      }
    ]
  },

  // 3. Animation
  {
    slug: 'animation',
    title: 'Animation & Modes',
    description: 'Creating moving effects.',
    category: 'Animation',
    lastUpdated: '2024-03-20',
    version: '2.0.0',
    tags: ['animation', 'modes'],
    sections: [
      {
        id: 'animation-modes',
        title: 'What Animation Modes are available?',
        paragraphs: [
          'The **Modes Panel** (Right Sidebar) offers powerful automated animations:',
          '- **Rotate Mode**: Spins the entire effect around the center. (Settings: `Speed`, `Direction`, `Frames`)',
          '- **Local Rotate**: Spins each shape around its own individual center. (Settings: `Speed`, `Radius`)',
          '- **Rise Mode**: Makes particles float upwards over time, useful for smoke/magic. (Settings: `Speed`, `Max Height`)',
          '- **Proximity Mode**: Activates effects only when a player is nearby (uses a "Proximity Chain").',
          '- **Chain Mode**: Plays elements in a specific sequence rather than all at once.'
        ]
      },
      {
        id: 'animation-custom',
        title: 'Can I create custom animations?',
        paragraphs: [
          'Yes, using **Action Recording**:',
          '1. Enable "Action Recording Mode".',
          '2. Move, rotate, or scale your objects on the canvas.',
          '3. AuraFX records these movements and generates keyframes automatically.',
          '4. The generated code will include complex positional data to replicate your exact movements.'
        ]
      }
    ]
  },

  // 4. Exporting
  {
    slug: 'exporting',
    title: 'Exporting Code',
    description: 'Getting your effect into Minecraft.',
    category: 'Workflows',
    lastUpdated: '2024-03-20',
    version: '2.0.0',
    tags: ['export', 'mythicmobs', 'datapack'],
    sections: [
      {
        id: 'how-to-export',
        title: 'How do I get the code?',
        paragraphs: [
          'Click the **Generate Code** button in the Left Toolbar (Code icon) or at the bottom of the Settings Panel.',
          'A panel will appear with the generated script.'
        ]
      },
      {
        id: 'workflows-export',
        title: 'How does code generation work?',
        paragraphs: [
          'AuraFX primarily generates **MythicMobs (YAML)** configuration.',
          '1. **Lines**: It converts shapes into mathematical lines (e.g., `particleline`, `particleorbital`).',
          '2. **Optimization**: It calculates offsets (`fo`, `so`, `uo`) automatically.',
          '3. **Action Recording**: If you recorded actions, it generates a frame-by-frame animation sequence using offsets and delays.',
          '4. **Formats**: You can also export as **Vanilla Commands** (McFunction) or **Datapack** (via the sidebar settings).'
        ]
      },
      {
        id: 'workflows-import',
        title: 'Can I import existing skills?',
        paragraphs: [
          'Importing complex MythicMobs skills back into AuraFX is **experimental**.',
          'Simple shapes may import correctly, but complex manual logic written outside AuraFX might not render perfectly.'
        ]
      }
    ]
  },

  // 5. Developer Guide
  {
    slug: 'developer-guide',
    title: 'Developer Guide',
    description: 'Technical details for contributors.',
    category: 'Developer Guide',
    lastUpdated: '2024-03-20',
    version: '1.0.0',
    tags: ['dev', 'architecture'],
    sections: [
      {
        id: 'optimizer',
        title: 'How does the Optimizer work?',
        paragraphs: [
          'The optimizer helps reduce particle count for better performance without losing shape quality.',
          '**Grid Sampling**: Divides the canvas into small grid cells and keeps only one particle per cell.',
          '**Merging**: Combines identical particles that are overlapping.',
          'You can enable these in the **Performance Panel**.'
        ]
      },
      {
        id: 'stack',
        title: 'What is the tech stack?',
        paragraphs: [
          '- **Framework**: Next.js (App Router)',
          '- **State Management**: Zustand (for 3D/Editor state) + React Context',
          '- **Styling**: Tailwind CSS + Framer Motion',
          '- **3D Engine**: React Three Fiber'
        ]
      }
    ]
  },

  // 6. Internals
  {
    slug: 'internals',
    title: 'Internal Systems',
    description: 'Hidden features and system logic.',
    category: 'Internals',
    lastUpdated: '2024-03-20',
    version: '1.0.0',
    tags: ['internals', 'matrix'],
    sections: [
      {
        id: 'webhook',
        title: 'How do discord notifications work?',
        paragraphs: [
          'The app uses a hidden webhook system to send effect generation stats to our Discord.',
          'For admin notifications, it even renders a high-quality PNG of the canvas and attaches it to the webhook payload.'
        ]
      },
      {
        id: 'easter-egg',
        title: 'Is there an Easter Egg?',
        paragraphs: [
          'There is a **Matrix Terminal** game hidden in the codebase (`EasterEggGame` component).',
          'It is a falling-text minigame, though access to it is currently hidden in the UI.'
        ]
      }
    ]
  },
  // --- NEW ARTICLES ---
  // 4. Interface Guide
  {
    slug: 'interface-guide',
    title: 'Interface Guide',
    description: 'Master the AuraFX workspace panels and toolbars.',
    category: 'Interface',
    lastUpdated: '2024-03-20',
    version: '2.0.0',
    tags: ['interface', 'ui', 'panels'],
    sections: [
      {
        id: 'panels',
        title: 'What panels are available?',
        paragraphs: [
          'The **Right Sidebar** houses the main control panels:',
          '- **Tools**: Configure active tool settings.',
          '- **Modes**: Toggle animation modes (Rotate, Rise, Chain, etc.).',
          '- **Element Config**: Fine-tune selected particles.',
          '- **Code**: Generate and export your effects.',
          '- **Import**: Bring in custom assets.',
          '- **Performance**: Optimize your scene.',
          '- **Chain/Recording**: Context-aware panels for specific modes.'
        ]
      },
      {
        id: 'toolbars',
        title: 'How do I customize the toolbar?',
        paragraphs: [
          'The **Left Toolbar** is fully customizable.',
          'Click the "Customize" option (usually the bottom icon) to open the **Toolbar Customization Modal**.',
          'You can select up to **5 tools** for quick access. Use the pagination to browse the full library of shapes.',
          'Your selection is saved automatically.'
        ]
      },
      {
        id: 'view-modes',
        title: 'Can I change the view perspective?',
        paragraphs: [
          'Yes. Use the **Top Center Toolbar** to switch between views:',
          '- **Top**: Standard 2D view (Default).',
          '- **Side/Diagonal/Isometric/Front**: Alternative perspectives (Note: Some may be temporarily disabled).',
          'This toolbar also contains the **REC** button when in Recording or Chain modes.'
        ]
      },
      {
        id: 'status-bar',
        title: 'What is the Bottom Status Bar?',
        paragraphs: [
          'Located at the bottom left, it provides:',
          '- **Layers Toggle**: Quickly show/hide the Layers panel.',
          '- **Zoom Controls**: Zoom In/Out buttons and current Zoom Level display.'
        ]
      }
    ]
  },
  // 5. Settings & Configuration
  {
    slug: 'configuration',
    title: 'Settings & Configuration',
    description: 'Configure AuraFX global settings and modes.',
    category: 'Configuration',
    lastUpdated: '2024-03-20',
    version: '2.0.0',
    tags: ['settings', 'config', 'preferences'],
    sections: [
      {
        id: 'config-global',
        title: 'What global settings can I change?',
        paragraphs: [
          'Click the **Settings (Gear)** icon in the left toolbar to access:',
          '- **General**: Set `Auto Save Interval` (10s - 300s) and switch `Theme` (Dark/Light).',
          '- **Performance**: Adjust `Render Quality` (Low/Normal/High) and `Cache Size` (128MB - 2GB).',
          '- **Interface**: Toggle `Split View` (experimental).'
        ]
      },
      {
        id: 'config-project',
        title: 'Where is my data saved?',
        paragraphs: [
          'AuraFX runs entirely in your browser using **Local Storage**.',
          'We do not store your projects on a server unless you explicitly use the "Share" feature (which generates a Discord webhook).'
        ]
      },
      {
        id: 'custom-particles',
        title: 'Can I use custom particles?',
        paragraphs: [
          'Yes. In the **Particle Select Modal**:',
          '1. Click "Add Custom".',
          '2. Enter the particle name.',
          '3. It will be saved to your local storage for future use.',
          'The list also fetches standard particles from our online repository.'
        ]
      }
    ]
  },
  // 6. 3D Editor
  {
    slug: '3d-editor',
    title: '3D Editor',
    description: 'Creating in three dimensions.',
    category: '3D',
    lastUpdated: '2024-03-20',
    version: '2.0.0',
    tags: ['3d', 'scene', 'transfer'],
    sections: [
      {
        id: 'transfer',
        title: 'How do I move between 2D and 3D?',
        paragraphs: [
          'You can transfer your work using the **URL Transfer** feature.',
          'Data is encoded in the URL parameter `?transfer=`, allowing you to share or move scenes easily.',
          'You can also export your entire 3D scene as a JSON file (`aurafx-3d-scene.json`) and load it back later.'
        ]
      },
      {
        id: 'performance-3d',
        title: 'My 3D scene is lagging, what can I do?',
        paragraphs: [
          'The 3D Editor includes an **Optimized Renderer** option in the top toolbar.',
          'Enable this if you have a large number of objects. You will also receive notifications if duplicate objects are detected.'
        ]
      }
    ]
  },
  // 7. Advanced Optimization
  {
    slug: 'advanced-optimization',
    title: 'Advanced Optimization',
    description: 'Deep dive into AuraFX optimization algorithms.',
    category: 'Optimization',
    lastUpdated: '2024-03-20',
    version: '2.0.0',
    tags: ['performance', 'optimization', 'rendering'],
    sections: [
      {
        id: 'smart-sampling',
        title: 'How does Smart Sampling work?',
        paragraphs: [
          'AuraFX uses intelligent algorithms to reduce particle count while maintaining visual fidelity:',
          '- **Grid Sampling**: Divides space into a grid and picks the most representative particle per cell. Best for preserving shape.',
          '- **Center Sampling**: Prioritizes particles near the center of the effect.',
          '- **Random/Step**: Faster methods for uniform reduction.'
        ]
      },
      {
        id: 'instanced-rendering',
        title: 'What is Instanced Rendering?',
        paragraphs: [
          'In the 3D Editor, when object count exceeds 100, the engine switches to **Instanced Mesh Rendering**.',
          'This allows drawing thousands of objects with a single draw call, significantly boosting performance.',
          'Enabling **Performance Mode** further improves FPS by lowering resolution and disabling shadows.'
        ]
      },
      {
        id: 'auto-optimize',
        title: 'What does Auto-Optimize do?',
        paragraphs: [
          'When enabled in the Performance Panel, it automatically:',
          '1. Merges similar effects to reduce overhead.',
          '2. Increases repeat intervals to lower update frequency.',
          '3. Compresses particle counts if they exceed the "Max Lines" threshold.'
        ]
      }
    ]
  },
  // 8. Controls & Shortcuts
  {
    slug: 'controls',
    title: 'Controls & Shortcuts',
    description: 'Complete list of keyboard and mouse controls.',
    category: 'Reference',
    lastUpdated: '2024-03-20',
    version: '2.0.0',
    tags: ['controls', 'shortcuts', 'keyboard', 'mouse'],
    sections: [
      {
        id: '2d-controls',
        title: '2D Canvas Controls (Standard Editor)',
        paragraphs: [
          '**Mouse Controls**',
          '- **Left Click**: Select object / Draw shape.',
          '- **Left Drag**: Move object / Free draw.',
          '- **Mouse Wheel**: Zoom In/Out.',
          '- **Middle Mouse Drag**: Pan Canvas.',
          '',
          '**Keyboard Shortcuts**',
          '- *Currently, the 2D Editor works primarily with mouse interactions.*',
          '- *We are working on adding keyboard shortcuts for the 2D canvas in future updates.*'
        ]
      },
      {
        id: '3d-controls',
        title: '3D Editor Controls',
        paragraphs: [
          '**Navigation (Blender Style)**',
          '- **Middle Mouse Drag**: Orbit/Rotate Camera.',
          '- **Shift + Middle Mouse**: Pan Camera.',
          '- **Mouse Wheel**: Zoom In/Out.',
          '- **Double Click Object**: Focus Camera.',
          '',
          '**Keyboard Shortcuts**',
          '- **Q**: Select Tool',
          '- **W**: Move Tool',
          '- **E**: Rotate Tool',
          '- **R**: Scale Tool',
          '- **Shift + A**: Add Object Menu',
          '- **Shift + D**: Duplicate Selected',
          '- **Delete**: Delete Selected',
          '- **Alt + Z**: Toggle X-Ray Mode',
          '- **Ctrl + Z**: Undo',
          '- **Ctrl + Shift + Z**: Redo'
        ]
      }
    ]
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

  // Custom sort order for categories
  const order = ['Essentials', 'Core Tools', 'Interface', 'Controls', 'Configuration', '3D', 'Optimization', 'Effect Types', 'Animation', 'Workflows', 'Developer Guide', 'Internals']

  articles.forEach((a) => {
    if (!byCat.has(a.category)) byCat.set(a.category, [])
    byCat.get(a.category)!.push(a)
  })

  // Sort categories by predefined order
  return Array.from(byCat.entries())
    .sort(([a], [b]) => {
      const idxA = order.indexOf(a)
      const idxB = order.indexOf(b)
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB)
    })
    .map(([name, items]) => ({ name, items }))
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
        ...a.sections.flatMap((s: ArticleSection) => [s.title, ...s.paragraphs]),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(lower)
    })
    .map(({ sections, ...meta }) => meta)
}