import { forwardRef } from 'react'
import clsx from 'clsx'
import { ComponentProps, ReactNode } from 'react'

type ContainerProps = {
  className?: string
  children: ReactNode
} & ComponentProps<'div'>

const OuterContainer = forwardRef<HTMLDivElement, ContainerProps>(function OuterContainer(
  { className, children, ...props },
  ref
) {
  return (
    <div ref={ref} className={clsx('sm:px-8', className)} {...props}>
      <div className="mx-auto max-w-7xl lg:px-8">{children}</div>
    </div>
  )
})

const InnerContainer = forwardRef<HTMLDivElement, ContainerProps>(function InnerContainer(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={clsx('relative px-4 sm:px-8 lg:px-12', className)}
      {...props}
    >
      <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  )
})

function Container({ children, ...props }: ContainerProps) {
  const { ref, ...restProps } = props as any
  return (
    <OuterContainer {...restProps}>
      <InnerContainer>{children}</InnerContainer>
    </OuterContainer>
  )
}

Container.Outer = OuterContainer
Container.Inner = InnerContainer

export { Container }
