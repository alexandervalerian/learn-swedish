import type { CefrLevel } from '~/stores/user'

export const LEVEL_META: Record<CefrLevel, {
  emoji: string
  name: string
  color: string
  badge: string
  pill: string
  activePill: string
  textColor: string
}> = {
  A1: { emoji: '🌲', name: 'Wald',    color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', pill: 'bg-emerald-100 text-emerald-700', activePill: 'bg-emerald-500 text-white', textColor: 'text-emerald-600' },
  A2: { emoji: '⛵', name: 'Schären', color: 'bg-sky-50 border-sky-200',         badge: 'bg-sky-100 text-sky-700',         pill: 'bg-sky-100 text-sky-700',         activePill: 'bg-sky-500 text-white',     textColor: 'text-sky-600' },
  B1: { emoji: '🏔️', name: 'Fjäll',   color: 'bg-violet-50 border-violet-200',   badge: 'bg-violet-100 text-violet-700',   pill: 'bg-violet-100 text-violet-700',   activePill: 'bg-violet-500 text-white',  textColor: 'text-violet-600' },
  B2: { emoji: '❄️', name: 'Vinter',  color: 'bg-amber-50 border-amber-200',     badge: 'bg-amber-100 text-amber-700',     pill: 'bg-amber-100 text-amber-700',     activePill: 'bg-amber-500 text-white',   textColor: 'text-amber-600' },
  C1: { emoji: '🦌', name: 'Elch',    color: 'bg-rose-50 border-rose-200',       badge: 'bg-rose-100 text-rose-700',       pill: 'bg-rose-100 text-rose-700',       activePill: 'bg-rose-500 text-white',    textColor: 'text-rose-600' },
}
