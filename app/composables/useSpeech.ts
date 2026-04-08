export function useSpeech() {
  const speaking = ref(false)
  const supported = ref(false)

  onMounted(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window)
      supported.value = true
  })

  function getSvVoice(): SpeechSynthesisVoice | null {
    return speechSynthesis.getVoices().find(v => v.lang === 'sv-SE') ?? null
  }

  function _doSpeak(text: string, rate: number) {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'sv-SE'
    u.rate = rate
    const voice = getSvVoice()
    if (voice) u.voice = voice
    u.onstart = () => { speaking.value = true }
    u.onend = () => { speaking.value = false }
    u.onerror = () => { speaking.value = false }
    speechSynthesis.speak(u)
  }

  function speak(text: string, rate = 0.85) {
    if (!supported.value) return
    cancel()
    if (getSvVoice()) {
      _doSpeak(text, rate)
    } else {
      const h = () => {
        speechSynthesis.removeEventListener('voiceschanged', h)
        _doSpeak(text, rate)
      }
      speechSynthesis.addEventListener('voiceschanged', h)
    }
  }

  function cancel() {
    if (!supported.value) return
    speechSynthesis.cancel()
    speaking.value = false
  }

  return { speak, cancel, speaking, supported }
}
