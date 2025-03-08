import { forwardRef } from 'react'
import clsx from 'clsx'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx('sm:px-8', className)}
        {...props}
      >
        <div className="mx-auto max-w-7xl lg:px-8">
          <div className="px-4 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
          </div>
        </div>
      </div>
    )
  }
)

Container.displayName = 'Container'

interface ContainerInnerProps {
  className?: string
  children: React.ReactNode
}

Container.Inner = forwardRef<HTMLDivElement, ContainerInnerProps>(
  function ContainerInner({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx('relative px-4 sm:px-8 lg:px-12', className)}
        {...props}
      >
        <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
      </div>
    )
  }
)

Container.Inner.displayName = 'Container.Inner' 