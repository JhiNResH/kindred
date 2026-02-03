'use client'

import { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[#adadb0] mb-2">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 bg-[#111113] border border-[#1f1f23] rounded-lg text-white text-sm placeholder:text-[#6b6b70] focus:outline-none focus:border-purple-500 transition ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
