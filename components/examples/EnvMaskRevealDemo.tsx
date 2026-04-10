'use client'

import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { useRef, useState } from 'react'
import type { CopyFeedbackState } from '@/lib/useCopyFeedback'
import { useCopyFeedback } from '@/lib/useCopyFeedback'
import styles from './EnvMaskRevealDemo.module.css'

const INITIAL_SPLIT = 44
const MIN_SPLIT = 10
const MAX_SPLIT = 90

const ENV_ROWS = [
  {
    name: 'DATABASE_URL',
    value: 'postgres://app:river-stone@db.internal:5432/voz',
  },
  {
    name: 'OPENAI_API_KEY',
    value: 'sk-prod-r4Kf8M1nQe7Vx2A',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    value: 'https://voz.dev',
  },
  {
    name: 'SESSION_SECRET',
    value: '9f2dcb39b4ce2c83741ac0e5',
  },
  {
    name: 'SENTRY_AUTH_TOKEN',
    value: 'sntr_6Fh1xP4Lm9Qa',
  },
] as const

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function maskValue(value: string) {
  return '*'.repeat(value.length)
}

const VISIBLE_ENV_OUTPUT = ENV_ROWS.map(
  (row) => `${row.name}=${row.value}`
).join('\n')
const MASKED_ENV_OUTPUT = ENV_ROWS.map(
  (row) => `${row.name}=${maskValue(row.value)}`
).join('\n')

type EnvPanelProps = {
  copyLabel: string
  copyState: CopyFeedbackState
  masked: boolean
  onCopy: () => void
  title: string
  tone: string
}

function EnvPanel({
  copyLabel,
  copyState,
  masked,
  onCopy,
  title,
  tone,
}: EnvPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>.env.production</p>
          <h3 className={styles.panelTitle}>{title}</h3>
        </div>
        <div className={styles.panelActions}>
          <button
            className={styles.copyButton}
            data-state={copyState}
            onClick={onCopy}
            type="button"
          >
            {copyLabel}
          </button>
          <span className={styles.modePill}>{tone}</span>
        </div>
      </div>

      <div className={styles.terminal}>
        <div className={styles.terminalDots}>
          <i />
          <i />
          <i />
        </div>

        <div className={styles.rows}>
          {ENV_ROWS.map((row, index) => (
            <div className={styles.row} key={row.name}>
              <span className={styles.rowNumber} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <code className={styles.assignment}>
                <span className={styles.varName}>{row.name}</span>
                <span className={styles.operator}>=</span>
                <span
                  className={masked ? styles.maskedValue : styles.realValue}
                >
                  {masked ? maskValue(row.value) : row.value}
                </span>
              </code>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <span>{masked ? 'Share-safe output' : 'Original values visible'}</span>
        <span>{ENV_ROWS.length} variables</span>
      </div>
    </div>
  )
}

export function EnvMaskRevealDemo() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [split, setSplit] = useState(INITIAL_SPLIT)
  const { copyValue, getLabel, getState } = useCopyFeedback<
    'masked' | 'visible'
  >()

  function updateSplit(clientX: number) {
    const element = stageRef.current
    if (!element) {
      return
    }

    const bounds = element.getBoundingClientRect()
    const ratio = clamp((clientX - bounds.left) / bounds.width, 0, 1)
    setSplit(clamp(ratio * 100, MIN_SPLIT, MAX_SPLIT))
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    updateSplit(event.clientX)
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }

    updateSplit(event.clientX)
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setSplit((current) => clamp(current - 2, MIN_SPLIT, MAX_SPLIT))
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setSplit((current) => clamp(current + 2, MIN_SPLIT, MAX_SPLIT))
    }
  }

  const style = {
    '--split': `${split}%`,
  } as CSSProperties

  return (
    <section className={styles.frame}>
      <div className={styles.stage} ref={stageRef} style={style}>
        <div className={`${styles.pane} ${styles.revealPane}`}>
          <EnvPanel
            copyLabel={getLabel('visible', 'Copy values')}
            copyState={getState('visible')}
            masked={false}
            onCopy={() => void copyValue('visible', VISIBLE_ENV_OUTPUT)}
            title="Full environment"
            tone="visible"
          />
        </div>

        <div className={`${styles.pane} ${styles.maskPane}`}>
          <EnvPanel
            copyLabel={getLabel('masked', 'Copy masked')}
            copyState={getState('masked')}
            masked
            onCopy={() => void copyValue('masked', MASKED_ENV_OUTPUT)}
            title="Masked environment"
            tone="redacted"
          />
        </div>

        <div aria-hidden="true" className={styles.splitEffect}>
          <div className={styles.splitBeam} />
          <div className={styles.splitGlow} />
          <div className={styles.splitNoise} />
        </div>

        <button
          aria-label="Drag to compare visible and masked environment variables"
          aria-orientation="horizontal"
          aria-valuemax={MAX_SPLIT}
          aria-valuemin={MIN_SPLIT}
          aria-valuenow={Math.round(split)}
          className={styles.dragHandle}
          onKeyDown={handleKeyDown}
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="slider"
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </section>
  )
}
