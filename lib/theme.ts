/**
 * AuraFX White Modern Theme Configuration
 * Beyaz modern tema için renk paleti ve tasarım sistemi
 */

export interface ThemeConfig {
  background: string
  surface: string
  primary: string
  secondary: string
  accent: string
  border: string
  text: string
  textSecondary: string
  hover: string
  active: string
  success: string
  warning: string
  error: string
  info: string
}

export const whiteModernTheme: ThemeConfig = {
  // Ana renkler
  background: '#ffffff',
  surface: '#fafafa',
  primary: '#000000',
  secondary: '#6b7280',
  accent: '#3b82f6',
  
  // Borders ve çizgiler
  border: '#e5e7eb',
  
  // Text renkler
  text: '#111827',
  textSecondary: '#6b7280',
  
  // Interactive states
  hover: '#f3f4f6',
  active: '#e5e7eb',
  
  // Status renkler
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
}

/**
 * Icon boyutları standardı
 */
export const iconSizes = {
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 32
} as const

/**
 * Spacing sistemi (8px grid)
 */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px'
} as const

/**
 * Border radius standardı
 */
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px'
} as const

/**
 * Typography sistemi
 */
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace']
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
} as const

/**
 * Shadow sistemi
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
} as const

/**
 * CSS Custom Properties oluşturucu
 */
export function generateCSSVariables(theme: ThemeConfig): Record<string, string> {
  return {
    '--theme-background': theme.background,
    '--theme-surface': theme.surface,
    '--theme-primary': theme.primary,
    '--theme-secondary': theme.secondary,
    '--theme-accent': theme.accent,
    '--theme-border': theme.border,
    '--theme-text': theme.text,
    '--theme-text-secondary': theme.textSecondary,
    '--theme-hover': theme.hover,
    '--theme-active': theme.active,
    '--theme-success': theme.success,
    '--theme-warning': theme.warning,
    '--theme-error': theme.error,
    '--theme-info': theme.info
  }
}