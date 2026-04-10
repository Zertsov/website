import { useEffect, useRef, useState } from 'react'

const RESET_DELAY_MS = 1600

export type CopyFeedbackState = 'idle' | 'copied' | 'error'

async function writeToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard is unavailable')
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'

  document.body.appendChild(textarea)

  try {
    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)

    if (!document.execCommand('copy')) {
      throw new Error('Clipboard is unavailable')
    }
  } finally {
    document.body.removeChild(textarea)
  }
}

export function useCopyFeedback<T extends string>() {
  const timeoutRef = useRef<number | null>(null)
  const [feedback, setFeedback] = useState<{
    key: T | null
    state: CopyFeedbackState
  }>({
    key: null,
    state: 'idle',
  })

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  function scheduleReset() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      setFeedback({ key: null, state: 'idle' })
      timeoutRef.current = null
    }, RESET_DELAY_MS)
  }

  async function copyValue(key: T, text: string) {
    try {
      await writeToClipboard(text)
      setFeedback({ key, state: 'copied' })
    } catch {
      setFeedback({ key, state: 'error' })
    } finally {
      scheduleReset()
    }
  }

  function getLabel(key: T, idleLabel: string) {
    if (feedback.key !== key) {
      return idleLabel
    }

    if (feedback.state === 'copied') {
      return 'Copied'
    }

    if (feedback.state === 'error') {
      return 'Copy failed'
    }

    return idleLabel
  }

  function getState(key: T): CopyFeedbackState {
    return feedback.key === key ? feedback.state : 'idle'
  }

  return { copyValue, getLabel, getState }
}
