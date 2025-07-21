import React from 'react'

interface CodeResponse {
  explanation: string
  code: string
  language: string
}

interface Step3Props {
  codeResponse: CodeResponse | null
  refinePrompt: string
  setRefinePrompt: (value: string) => void
}

const Step3GeneratedCode: React.FC<Step3Props> = ({
  codeResponse,
  refinePrompt,
  setRefinePrompt
}) => {
  if (!codeResponse) return null

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generated Code</h3>
          <button className="btn btn-outline btn-sm">📋 Copy</button>
        </div>

        <div className="alert alert-info">
          <div>
            <h4 className="font-semibold mb-2">AI Explanation</h4>
            <p className="text-sm opacity-90">{codeResponse.explanation}</p>
          </div>
        </div>

        <div className="mockup-code">
          <div className="flex items-center justify-between px-6 py-2 bg-neutral text-neutral-content">
            <div className="flex items-center">
              <span className="mr-2">💻</span>
              <span className="text-sm font-medium">
                {codeResponse.language}
              </span>
            </div>
          </div>
          <pre className="px-6 py-4 overflow-x-auto text-sm max-h-96">
            <code>{codeResponse.code}</code>
          </pre>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Refine & Improve</h3>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Feedback and Refinement Instructions
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered h-32 resize-none"
            placeholder="e.g., Add loading states, improve error handling..."
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
          />
          <div className="label">
            <span className="label-text-alt text-xs opacity-70">
              💡 Tip: Be specific about what you want to change or improve
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn btn-warning flex-1">🔄 Refine Code</button>
          <button className="btn btn-outline">↻ Reset</button>
        </div>

        <div className="divider"></div>
        <div>
          <h4 className="font-semibold mb-3">Version History</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <div className="alert alert-success alert-sm">
              <div className="text-sm">
                <span className="font-semibold">v1.2:</span> Added form
                validation and accessibility improvements
              </div>
            </div>
            <div className="alert alert-info alert-sm">
              <div className="text-sm">
                <span className="font-semibold">v1.1:</span> Added loading
                states and improved error handling
              </div>
            </div>
            <div className="alert alert-warning alert-sm">
              <div className="text-sm">
                <span className="font-semibold">v1.0:</span> Initial code
                generation
              </div>
            </div>
          </div>
        </div>

        <div className="divider"></div>
        <div>
          <h4 className="font-semibold mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-sm btn-outline">🔧 Add Comments</button>
            <button className="btn btn-sm btn-outline">
              🎨 Improve Styling
            </button>
            <button className="btn btn-sm btn-outline">
              ⚡ Optimize Performance
            </button>
            <button className="btn btn-sm btn-outline">
              🛡️ Add Error Handling
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step3GeneratedCode
