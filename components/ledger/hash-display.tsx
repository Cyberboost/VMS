'use client'

export function HashDisplay({ hash, label = 'Hash' }: { hash: string; label?: string }) {
  const shortHash = `${hash.slice(0, 8)}...${hash.slice(-8)}`

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{shortHash}</code>
        <button
          onClick={() => navigator.clipboard.writeText(hash)}
          className="text-xs text-blue-600 hover:underline"
          title="Copy full hash"
        >
          Copy
        </button>
      </div>
    </div>
  )
}
