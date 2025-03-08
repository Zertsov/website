import clsx from 'clsx'

interface ProseProps {
  className?: string
  children: React.ReactNode
}

export function Prose({ className, children }: ProseProps) {
  return (
    <div className={clsx(className, 'prose dark:prose-invert')}>{children}</div>
  )
} 