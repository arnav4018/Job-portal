"use client"

import Link from 'next/link'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils'

interface LinkButtonProps extends Omit<ButtonProps, 'asChild' | 'onClick' | 'onMouseDown' | 'onMouseUp' | 'onKeyDown' | 'onKeyUp'> {
  href: string
  children: React.ReactNode
  className?: string
}

export function LinkButton({ 
  href, 
  children, 
  className, 
  variant,
  size,
  disabled,
  type,
  ...otherProps 
}: LinkButtonProps) {
  return (
    <Link href={href}>
      <Button 
        className={cn(className)}
        variant={variant}
        size={size}
        disabled={disabled}
        type={type}
      >
        {children}
      </Button>
    </Link>
  )
}
