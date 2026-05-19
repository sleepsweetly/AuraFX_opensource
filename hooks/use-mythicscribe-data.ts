import { useState, useEffect } from 'react'

export interface MythicSuggestion {
  label: string
  description?: string
  kind: 'mechanic' | 'condition' | 'targeter' | 'attribute'
  attributes?: string[]
}

export interface MythicSuggestionMaps {
  byKind: {
    mechanic: Map<string, MythicSuggestion>
    condition: Map<string, MythicSuggestion>
    targeter: Map<string, MythicSuggestion>
    attribute: Map<string, MythicSuggestion>
  }
  attributesByMechanic: Map<string, Set<string>>
}

export function useMythicScribeData() {
  const [data, setData] = useState<MythicSuggestionMaps | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load MythicMobs data
        const mythicMobsResponse = await fetch('/extensions/mythicscribe/data/mechanics/MythicMobs.json')
        const mythicMobsData = await mythicMobsResponse.json()

        // Load conditions data
        const conditionsResponse = await fetch('/extensions/mythicscribe/data/conditions/MythicMobs.json')
        const conditionsData = await conditionsResponse.json()

        // Load targeters data
        const targetersResponse = await fetch('/extensions/mythicscribe/data/targeters/MythicMobs.json')
        const targetersData = await targetersResponse.json()

        if (!mounted) return

        // Process data into maps
        const byKind = {
          mechanic: new Map<string, MythicSuggestion>(),
          condition: new Map<string, MythicSuggestion>(),
          targeter: new Map<string, MythicSuggestion>(),
          attribute: new Map<string, MythicSuggestion>()
        }

        const attributesByMechanic = new Map<string, Set<string>>()

        // Process mechanics (array format)
        if (Array.isArray(mythicMobsData)) {
          for (const mechanic of mythicMobsData) {
            if (mechanic.name && Array.isArray(mechanic.name)) {
              // Each mechanic can have multiple names
              for (const name of mechanic.name) {
                const suggestion: MythicSuggestion = {
                  label: name,
                  description: mechanic.description || '',
                  kind: 'mechanic',
                  attributes: mechanic.attributes?.map((attr: any) => 
                    Array.isArray(attr.name) ? attr.name[0] : attr.name
                  ) || []
                }
                byKind.mechanic.set(name.toLowerCase(), suggestion)

                // Store attributes for this mechanic
                if (mechanic.attributes) {
                  const attrNames = mechanic.attributes.map((attr: any) => 
                    Array.isArray(attr.name) ? attr.name[0] : attr.name
                  )
                  attributesByMechanic.set(name.toLowerCase(), new Set(attrNames))
                }
              }
            }
          }
        }

        // Process conditions (array format)
        if (Array.isArray(conditionsData)) {
          for (const condition of conditionsData) {
            if (condition.name && Array.isArray(condition.name)) {
              for (const name of condition.name) {
                const suggestion: MythicSuggestion = {
                  label: name,
                  description: condition.description || '',
                  kind: 'condition'
                }
                byKind.condition.set(name.toLowerCase(), suggestion)
              }
            }
          }
        }

        // Process targeters (array format)
        if (Array.isArray(targetersData)) {
          for (const targeter of targetersData) {
            if (targeter.name && Array.isArray(targeter.name)) {
              for (const name of targeter.name) {
                const suggestion: MythicSuggestion = {
                  label: name,
                  description: targeter.description || '',
                  kind: 'targeter'
                }
                byKind.targeter.set(name.toLowerCase(), suggestion)
              }
            }
          }
        }

        const result: MythicSuggestionMaps = {
          byKind,
          attributesByMechanic
        }

        console.log('MythicScribe data loaded:', {
          mechanics: byKind.mechanic.size,
          conditions: byKind.condition.size,
          targeters: byKind.targeter.size,
          attributesByMechanic: attributesByMechanic.size
        })

        setData(result)
        setLoading(false)
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load MythicScribe data')
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  return { data, loading, error }
}
