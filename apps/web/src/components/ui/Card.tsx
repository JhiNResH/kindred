'use client'

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 bg-[#111113] border border-[#1f1f23] rounded-xl ${className}`} {...props}>
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
