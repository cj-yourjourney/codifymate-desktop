import React from 'react'
import { useAppSelector } from '@/shared/store/hook'

interface Step3Props {
  refinePrompt: string
  setRefinePrompt: (value: string) => void
}

const Step3CodeGeneration: React.FC<Step3Props> = ({
  refinePrompt,
  setRefinePrompt
}) => {
  const { generatedCodeVersions, currentVersion, loading, error } =
    useAppSelector((state) => state.codeGeneration)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-4">Generating code...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    )
  }

  if (!currentVersion) {
    return (
      <div className="text-center py-8 text-base-content/60">
        No code generated yet. Please complete the previous steps first.
      </div>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You might want to show a toast notification here
  }

  const formatVersionHistory = () => {
    return generatedCodeVersions.map((version, index) => {
      const isLatest = version.id === currentVersion?.id
      const alertType = isLatest ? 'alert-success' : 'alert-info'

      return (
        <div key={version.id} className={`alert ${alertType} alert-sm`}>
          <div className="text-sm">
            <span className="font-semibold">{version.version}:</span>{' '}
            {version.explanation.substring(0, 80)}
            {version.explanation.length > 80 ? '...' : ''}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generated Code</h3>
          <button
            className="btn btn-outline btn-sm"
            onClick={() =>
              copyToClipboard(
                currentVersion.files_to_modify.map((f) => f.code).join('\n\n')
              )
            }
          >
            📋 Copy
          </button>
        </div>

        <div className="alert alert-info">
          <div>
            <h4 className="font-semibold mb-2">AI Explanation</h4>
            <p className="text-sm opacity-90">{currentVersion.explanation}</p>
            {currentVersion.additional_notes && (
              <div className="mt-2">
                <h5 className="font-medium text-xs opacity-75">
                  Additional Notes:
                </h5>
                <p className="text-xs opacity-70">
                  {currentVersion.additional_notes}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {currentVersion.files_to_modify.map((file, index) => (
            <div key={index} className="mockup-code">
              <div className="flex items-center justify-between px-6 py-2 bg-neutral text-neutral-content">
                <div className="flex items-center">
                  <span className="mr-2">📄</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {file.file_path.split('/').pop()}
                    </span>
                    <span className="text-xs opacity-70">
                      {file.change_type} • {file.file_path}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => copyToClipboard(file.code)}
                >
                  📋
                </button>
              </div>
              <div className="px-6 py-2 bg-base-300">
                <p className="text-xs text-base-content/70">
                  {file.description}
                </p>
              </div>
              <pre className="px-6 py-4 overflow-x-auto text-sm max-h-96">
                <code>{file.code}</code>
              </pre>
            </div>
          ))}
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
            {generatedCodeVersions.length > 0 ? (
              formatVersionHistory()
            ) : (
              <div className="text-center py-4 text-base-content/60 text-sm">
                No version history yet
              </div>
            )}
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

export default Step3CodeGeneration
