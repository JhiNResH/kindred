'use client'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ className = '', children, hoverable = false, padding = 'md', ...props }: CardProps) {
  const hoverStyles = hoverable 
    ? 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer' 
    : ''
  
  const paddingStyles = paddingMap[padding]
  
  return (
    <div className={`${paddingStyles} bg-[#111113] border border-[#1f1f23] rounded-xl ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

export function CardTitle({ className = '', children }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
}

export function CardContent({ className = '', children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className}>{children}</div>
}
