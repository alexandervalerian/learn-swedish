import type { CefrLevel } from '~/stores/user'

export const LEVEL_META: Record<CefrLevel, {
  emoji: string
  name: string
  color: string
  badge: string
  pill: string
  activePill: string
  textColor: string
  ringColor: string
}> = {
  A1: { emoji: '🌲', name: 'Wald',    color: 'bg-a1-bg border-a1-border', badge: 'bg-a1-border text-a1-ink', pill: 'bg-a1-border text-a1-ink', activePill: 'bg-a1-accent text-white', textColor: 'text-a1-ink',  ringColor: '#2E7D32' },
  A2: { emoji: '⛵', name: 'Schären', color: 'bg-a2-bg border-a2-border', badge: 'bg-a2-border text-a2-ink', pill: 'bg-a2-border text-a2-ink', activePill: 'bg-a2-accent text-white', textColor: 'text-a2-ink',  ringColor: '#1565C0' },
  B1: { emoji: '🏔️', name: 'Fjäll',   color: 'bg-b1-bg border-b1-border', badge: 'bg-b1-border text-b1-ink', pill: 'bg-b1-border text-b1-ink', activePill: 'bg-b1-accent text-white', textColor: 'text-b1-ink',  ringColor: '#5E35B1' },
  B2: { emoji: '❄️', name: 'Vinter',  color: 'bg-b2-bg border-b2-border', badge: 'bg-b2-border text-b2-ink', pill: 'bg-b2-border text-b2-ink', activePill: 'bg-b2-accent text-white', textColor: 'text-b2-ink',  ringColor: '#F57F17' },
  C1: { emoji: '🦌', name: 'Elch',    color: 'bg-c1-bg border-c1-border', badge: 'bg-c1-border text-c1-ink', pill: 'bg-c1-border text-c1-ink', activePill: 'bg-c1-accent text-white', textColor: 'text-c1-ink',  ringColor: '#C62828' },
}
