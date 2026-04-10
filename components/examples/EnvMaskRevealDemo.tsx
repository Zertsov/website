'use client'

import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { useState } from 'react'
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

type EnvPanelProps = {
  masked: boolean
  title: string
  tone: string
}

function EnvPanel({ masked, title, tone }: EnvPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>.env.production</p>
          <h3 className={styles.panelTitle}>{title}</h3>
        </div>
        <span className={styles.modePill}>{tone}</span>
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
                <span className={masked ? styles.maskedValue : styles.realValue}>
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
  const [split, setSplit] = useState(INITIAL_SPLIT)

  function updateSplit(clientX: number, element: HTMLDivElement) {
    const bounds = element.getBoundingClientRect()
    const ratio = clamp((clientX - bounds.left) / bounds.width, 0, 1)
    setSplit(clamp(ratio * 100, MIN_SPLIT, MAX_SPLIT))
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    updateSplit(event.clientX, event.currentTarget)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }

    updateSplit(event.clientX, event.currentTarget)
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
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
      <div
        className={styles.stage}
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={style}
      >
        <div className={`${styles.pane} ${styles.revealPane}`}>
          <EnvPanel masked={false} title="Full environment" tone="visible" />
        </div>

        <div aria-hidden="true" className={`${styles.pane} ${styles.maskPane}`}>
          <EnvPanel masked title="Masked environment" tone="redacted" />
        </div>

        <div aria-hidden="true" className={styles.splitEffect}>
          <div className={styles.splitBeam} />
          <div className={styles.splitGlow} />
          <div className={styles.splitNoise} />
        </div>

        <button
          aria-label="Drag to compare visible and masked environment variables"
          aria-orientation="horizontal"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(split)}
          className={styles.dragHandle}
          onKeyDown={handleKeyDown}
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
