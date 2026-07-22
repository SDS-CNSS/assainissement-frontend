import { useCallback, useEffect, useState } from 'react'
import { Alert } from '@/components/ui'

export const FLASH_FEEDBACK_DURATION_MS = 3000

export interface FlashFeedbackState {
  variant: 'success' | 'error'
  message: string
}

export function useFlashFeedback() {
  const [feedback, setFeedbackState] = useState<FlashFeedbackState | null>(null)
  const clearFeedback = useCallback(() => setFeedbackState(null), [])
  const setFeedback = useCallback((next: FlashFeedbackState) => {
    setFeedbackState(next)
  }, [])

  return { feedback, setFeedback, clearFeedback }
}

export function FlashFeedback({
  feedback,
  onDismiss,
  durationMs = FLASH_FEEDBACK_DURATION_MS,
  className,
}: {
  feedback: FlashFeedbackState | null
  onDismiss: () => void
  durationMs?: number
  className?: string
}) {
  useEffect(() => {
    if (!feedback) return

    const timer = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(timer)
  }, [feedback, onDismiss, durationMs])

  if (!feedback) {
    return null
  }

  return (
    <Alert variant={feedback.variant} className={className}>
      {feedback.message}
    </Alert>
  )
}
