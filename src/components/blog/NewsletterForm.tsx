'use client'

import { useState } from 'react'
import { Mail, ArrowRight, Check } from 'lucide-react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center">
        <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-emerald-300 font-medium text-sm">You&apos;re subscribed!</p>
        <p className="text-slate-500 text-xs mt-1">Check your inbox for a welcome email.</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-sky-400" />
        <h3 className="text-sm font-bold text-white">Newsletter</h3>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Get trucking news, tips & insights delivered weekly.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-sky-500 hover:bg-sky-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      {status === 'error' && (
        <p className="text-rose-400 text-xs mt-2">Something went wrong. Try again.</p>
      )}
    </div>
  )
}
