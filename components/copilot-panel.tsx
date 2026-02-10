'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Bot, Send, X } from 'lucide-react'

interface CopilotPanelProps {
  isOpen: boolean
  onClose: () => void
}

const examplePrompts = [
  'Which vehicles need DOT inspections soon?',
  'Show me recent incidents by department',
  'What is our fleet availability rate?',
  'Which drivers have expiring CDLs?',
  'List vehicles due for replacement',
]

export function CopilotPanel({ isOpen, onClose }: CopilotPanelProps) {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    // Simulate API call - replace with actual OpenAI integration
    setTimeout(() => {
      setResponse(
        `This is a placeholder response for: "${question}"\n\nIn production, this would connect to an AI service (like OpenAI) to provide intelligent answers about your fleet data, including:\n\n• Vehicle status and availability\n• Maintenance schedules and history\n• Incident analysis and trends\n• Driver performance metrics\n• Budget and cost analysis\n• Compliance tracking\n\nThe AI would query your fleet database and provide actionable insights based on real-time data.`
      )
      setLoading(false)
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 z-50 h-screen w-96 border-l bg-background shadow-lg">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Fleet Copilot</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ask a Question</CardTitle>
              <CardDescription className="text-xs">
                Get instant insights about your fleet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="Ask about your fleet..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" size="icon" disabled={loading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              {response && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="whitespace-pre-wrap">{response}</p>
                </div>
              )}

              {!response && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Example questions:
                  </p>
                  <div className="space-y-2">
                    {examplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setQuestion(prompt)}
                        className="w-full rounded-md border bg-card p-2 text-left text-xs hover:bg-accent"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>
                <strong>To enable AI features:</strong>
              </p>
              <ol className="list-inside list-decimal space-y-1">
                <li>Set up an OpenAI API key</li>
                <li>Add OPENAI_API_KEY to .env</li>
                <li>Implement the AI service layer</li>
                <li>Connect to fleet database queries</li>
              </ol>
              <p className="mt-2">
                The AI can analyze fleet data, predict maintenance needs, identify cost-saving
                opportunities, and provide compliance alerts.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
