import { defineStore } from 'pinia'
import { today } from '~/composables/useSpacedRepetition'
import { LEVEL_ORDER, type CefrLevel } from '~/stores/user'
import tasksData from '~/data/writing/tasks.json'

const STORAGE_KEY = 'swedish_writing'

export interface WritingTask {
  id: string
  title: string
  prompt: string
  minWords: number
  maxWords: number
}

interface WritingEntry {
  taskId: string
  date: string
  text: string
  submittedAt: string
}

interface StoredData {
  entries: Record<string, WritingEntry>
}

function daysSinceEpoch(dateStr: string): number {
  return Math.floor(new Date(dateStr).getTime() / 86_400_000)
}

export const useWritingStore = defineStore('writing', () => {
  const entries = ref<Record<string, WritingEntry>>({})
  const draft = ref('')

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const data: StoredData = JSON.parse(raw)
        entries.value = data.entries ?? {}
      } catch {
        // corrupted — start fresh
      }
    }
  }

  function save() {
    const data: StoredData = { entries: entries.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function getTodayTaskIndex(level: CefrLevel): number {
    const pool = (tasksData as Record<string, WritingTask[]>)[level]
    return daysSinceEpoch(today()) % pool.length
  }

  function getTodayTask(level: CefrLevel): WritingTask {
    const pool = (tasksData as Record<string, WritingTask[]>)[level]
    return pool[getTodayTaskIndex(level)]!
  }

  function isTodayDone(level: CefrLevel): boolean {
    const task = getTodayTask(level)
    return entries.value[task.id]?.date === today()
  }

  function getEntry(taskId: string): WritingEntry | null {
    return entries.value[taskId] ?? null
  }

  function submitEntry(taskId: string, text: string) {
    entries.value[taskId] = {
      taskId,
      date: today(),
      text,
      submittedAt: new Date().toISOString()
    }
    save()
  }

  return {
    entries,
    draft,
    load,
    save,
    getTodayTask,
    isTodayDone,
    getEntry,
    submitEntry,
    LEVEL_ORDER
  }
})
