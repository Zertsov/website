'use client'

import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { useRef, useState } from 'react'
import { useCopyFeedback } from '@/lib/useCopyFeedback'
import styles from './CodeRevealDemo.module.css'

const INITIAL_SPLIT = 55
const MIN_SPLIT = 8
const MAX_SPLIT = 92
const ISSUE_LABEL = 'Issue composer'
const INITIAL_ISSUE_TITLE = 'Slider reveal distorts the UI'
const ISSUE_QUEUE_OPTIONS = ['Backlog', 'In review', 'Ready to ship'] as const
const INITIAL_ISSUE_QUEUE = ISSUE_QUEUE_OPTIONS[0]
const ISSUE_TAG_OPTIONS = ['P2', 'Design', 'Frontend', 'Bug', 'QA'] as const
const INITIAL_ISSUE_TAGS = ['P2', 'Design', 'Frontend'] as const

type CopyTarget = 'code' | 'values'
type CodeTokenKind = 'keyword' | 'fn' | 'tag' | 'attr' | 'string'
type CodeSegment = {
  text: string
  kind?: CodeTokenKind
}

function segment(text: string, kind?: CodeTokenKind): CodeSegment {
  return { text, kind }
}

function getCodeTokenClass(kind?: CodeTokenKind) {
  if (kind === 'keyword') {
    return styles.tokenKeyword
  }

  if (kind === 'fn') {
    return styles.tokenFn
  }

  if (kind === 'tag') {
    return styles.tokenTag
  }

  if (kind === 'attr') {
    return styles.tokenAttr
  }

  if (kind === 'string') {
    return styles.tokenString
  }

  return undefined
}

const ISSUE_COMPOSER_CODE_LINES: CodeSegment[][] = [
  [
    segment('export function', 'keyword'),
    segment(' '),
    segment('IssueComposer', 'fn'),
    segment('() {'),
  ],
  [
    segment('  '),
    segment('const', 'keyword'),
    segment(' [title, setTitle] = '),
    segment('useState', 'fn'),
    segment('('),
    segment('"Slider reveal distorts the UI"', 'string'),
    segment(');'),
  ],
  [
    segment('  '),
    segment('const', 'keyword'),
    segment(' [queue, setQueue] = '),
    segment('useState', 'fn'),
    segment('('),
    segment('"Backlog"', 'string'),
    segment(');'),
  ],
  [
    segment('  '),
    segment('const', 'keyword'),
    segment(' [tags, setTags] = '),
    segment('useState', 'fn'),
    segment('(['),
    segment('"P2"', 'string'),
    segment(', '),
    segment('"Design"', 'string'),
    segment(', '),
    segment('"Frontend"', 'string'),
    segment(']);'),
  ],
  [
    segment('  '),
    segment('const', 'keyword'),
    segment(' [queued, setQueued] = '),
    segment('useState', 'fn'),
    segment('(false);'),
  ],
  [],
  [
    segment('  '),
    segment('function', 'keyword'),
    segment(' '),
    segment('toggleTag', 'fn'),
    segment('(tag) {'),
  ],
  [segment('    '), segment('setQueued', 'fn'), segment('(false);')],
  [segment('    '), segment('setTags', 'fn'), segment('((current) =>')],
  [segment('      current.'), segment('includes', 'fn'), segment('(tag)')],
  [
    segment('        ? current.'),
    segment('filter', 'fn'),
    segment('((value) => value !== tag)'),
  ],
  [segment('        : [...current, tag]')],
  [segment('    );')],
  [segment('  }')],
  [],
  [segment('  '), segment('return', 'keyword'), segment(' (')],
  [
    segment('    '),
    segment('<section', 'tag'),
    segment(' '),
    segment('className', 'attr'),
    segment('='),
    segment('"componentCard"', 'string'),
    segment('>', 'tag'),
  ],
  [segment('      '), segment('<input', 'tag')],
  [segment('        '), segment('value', 'attr'), segment('={title}')],
  [segment('        '), segment('onChange', 'attr'), segment('={(event) => {')],
  [segment('          '), segment('setQueued', 'fn'), segment('(false);')],
  [
    segment('          '),
    segment('setTitle', 'fn'),
    segment('(event.target.value);'),
  ],
  [segment('        }}')],
  [segment('      '), segment('/>', 'tag')],
  [segment('      '), segment('<select', 'tag')],
  [segment('        '), segment('value', 'attr'), segment('={queue}')],
  [segment('        '), segment('onChange', 'attr'), segment('={(event) => {')],
  [segment('          '), segment('setQueued', 'fn'), segment('(false);')],
  [
    segment('          '),
    segment('setQueue', 'fn'),
    segment('(event.target.value);'),
  ],
  [segment('        }}')],
  [segment('      '), segment('/>', 'tag')],
  [
    segment('      {['),
    segment('"P2"', 'string'),
    segment(', '),
    segment('"Design"', 'string'),
    segment(', '),
    segment('"Frontend"', 'string'),
    segment('].'),
    segment('map', 'fn'),
    segment('((tag) => ('),
  ],
  [
    segment('        '),
    segment('<button', 'tag'),
    segment(' '),
    segment('key', 'attr'),
    segment('={tag} '),
    segment('onClick', 'attr'),
    segment('={() => '),
    segment('toggleTag', 'fn'),
    segment('(tag)}>'),
  ],
  [segment('          {tag}')],
  [segment('        '), segment('</button>', 'tag')],
  [segment('      ))}')],
  [
    segment('      '),
    segment('<button', 'tag'),
    segment(' '),
    segment('onClick', 'attr'),
    segment('={() => '),
    segment('setQueued', 'fn'),
    segment('(true)}>'),
  ],
  [
    segment('        {queued ? '),
    segment('"Queued"', 'string'),
    segment(' : '),
    segment('"Create issue"', 'string'),
    segment('}'),
  ],
  [segment('      '), segment('</button>', 'tag')],
  [segment('    '), segment('</section>', 'tag')],
  [segment('  );')],
  [segment('}')],
]

const ISSUE_COMPOSER_CODE = ISSUE_COMPOSER_CODE_LINES.map((line) =>
  line.map(({ text }) => text).join('')
).join('\n')

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function toggleValue(values: string[], value: string) {
  if (values.includes(value)) {
    return values.filter((current) => current !== value)
  }

  return [...values, value]
}

export function CodeRevealDemo() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [split, setSplit] = useState(INITIAL_SPLIT)
  const [title, setTitle] = useState(INITIAL_ISSUE_TITLE)
  const [queue, setQueue] =
    useState<(typeof ISSUE_QUEUE_OPTIONS)[number]>(INITIAL_ISSUE_QUEUE)
  const [selectedTags, setSelectedTags] = useState<string[]>([
    ...INITIAL_ISSUE_TAGS,
  ])
  const [isQueued, setIsQueued] = useState(false)
  const { copyValue, getLabel, getState } = useCopyFeedback<CopyTarget>()

  const statusLabel = isQueued ? 'Queued' : 'Draft'
  const primaryActionLabel = isQueued ? 'Queued' : 'Create issue'
  const serializedTitle = title.trim() || '(empty title)'
  const serializedTags =
    selectedTags.length > 0 ? selectedTags : ['(no tags selected)']
  const issueComposerOutput = [
    statusLabel,
    ISSUE_LABEL,
    'Issue title',
    serializedTitle,
    'Queue',
    queue,
    ...serializedTags,
    primaryActionLabel,
  ].join('\n')

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

  function handleTitleChange(value: string) {
    setIsQueued(false)
    setTitle(value)
  }

  function handleQueueChange(value: (typeof ISSUE_QUEUE_OPTIONS)[number]) {
    setIsQueued(false)
    setQueue(value)
  }

  function handleTagToggle(tag: string) {
    setIsQueued(false)
    setSelectedTags((current) => toggleValue(current, tag))
  }

  const style = {
    '--split': `${split}%`,
  } as CSSProperties

  return (
    <section className={styles.frame}>
      <div className={styles.stage} ref={stageRef} style={style}>
        <div className={`${styles.pane} ${styles.livePane}`}>
          <div className={`${styles.ambientRing} ${styles.ambientRingA}`} />
          <div className={`${styles.ambientRing} ${styles.ambientRingB}`} />

          <div className={styles.componentCard}>
            <div className={styles.cardOrb} />
            <div className={styles.cardHeader}>
              <span className={styles.statusPill}>{statusLabel}</span>
              <span className={styles.mutedLabel}>{ISSUE_LABEL}</span>
            </div>

            <div className={styles.componentBody}>
              <label className={styles.field}>
                <span>Issue title</span>
                <input
                  onChange={(event) => handleTitleChange(event.target.value)}
                  type="text"
                  value={title}
                />
              </label>

              <label className={styles.field}>
                <span>Queue</span>
                <div className={styles.selectWrap}>
                  <select
                    className={styles.selectField}
                    onChange={(event) =>
                      handleQueueChange(
                        event.target
                          .value as (typeof ISSUE_QUEUE_OPTIONS)[number]
                      )
                    }
                    value={queue}
                  >
                    {ISSUE_QUEUE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span aria-hidden="true" className={styles.caret}>
                    ⌄
                  </span>
                </div>
              </label>

              <div className={styles.field}>
                <span>Tags</span>
                <div className={styles.metaRow}>
                  {ISSUE_TAG_OPTIONS.map((tag) => {
                    const isActive = selectedTags.includes(tag)

                    return (
                      <button
                        className={styles.tagButton}
                        data-active={isActive}
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        type="button"
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={styles.actionRow}>
                <button
                  className={styles.secondaryAction}
                  data-state={getState('values')}
                  onClick={() => void copyValue('values', issueComposerOutput)}
                  type="button"
                >
                  {getLabel('values', 'Copy values')}
                </button>
                <button
                  className={styles.primaryAction}
                  disabled={title.trim().length === 0}
                  onClick={() => setIsQueued(true)}
                  type="button"
                >
                  {primaryActionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.pane} ${styles.codePane}`}>
          <div className={styles.codePanel}>
            <div className={styles.codeHeader}>
              <span>IssueComposer.tsx</span>
              <div className={styles.headerActions}>
                <button
                  className={styles.copyAction}
                  data-state={getState('code')}
                  onClick={() => void copyValue('code', ISSUE_COMPOSER_CODE)}
                  type="button"
                >
                  {getLabel('code', 'Copy code')}
                </button>
                <span className={styles.codeDotRow}>
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>

            <pre className={styles.codeBlock}>
              <code>
                {ISSUE_COMPOSER_CODE_LINES.map((line, index) => (
                  <span
                    className={styles.codeLine}
                    key={`${index + 1}-${line.map(({ text }) => text).join('')}`}
                  >
                    {line.length === 0
                      ? ' '
                      : line.map(({ kind, text }, segmentIndex) => (
                          <span
                            className={getCodeTokenClass(kind)}
                            key={`${index + 1}-${segmentIndex + 1}`}
                          >
                            {text}
                          </span>
                        ))}
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </div>

        <div aria-hidden="true" className={styles.splitEffect}>
          <div className={styles.splitCore} />
          <div className={styles.splitGlow} />
          <div className={styles.splitRipple} />
        </div>

        <button
          aria-label="Drag to reveal code"
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
