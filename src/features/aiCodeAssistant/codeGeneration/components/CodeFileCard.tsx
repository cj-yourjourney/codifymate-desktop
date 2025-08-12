import React, { useState } from 'react'
import DiffModal from './DiffModal'

interface CodeFileCardProps {
  file: {
    file_path: string
    change_type: string
    description: string
    code: string
  }
  onFileAction: (file: any) => void
  onCopy: (code: string) => void
}

const CodeFileCard: React.FC<CodeFileCardProps> = ({
  file,
  onFileAction,
  onCopy
}) => {
  const [showDiffModal, setShowDiffModal] = useState(false)

  const handleFileActionClick = () => {
    setShowDiffModal(true)
  }

  const handleConfirmAction = () => {
    onFileAction(file)
    setShowDiffModal(false)
  }

  return (
    <>
      <div className="border border-base-300 rounded-lg overflow-hidden">
        {/* File Header */}
        <div className="bg-accent px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-neutral-content/10 rounded-md flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold">
                  {file.file_path.split('/').pop()}
                </div>
                <div className="text-xs opacity-70 flex items-center space-x-2">
                  <span
                    className={`badge badge-xs ${
                      file.change_type === 'create'
                        ? 'badge-success'
                        : file.change_type === 'modify'
                        ? 'badge-warning'
                        : 'badge-primary'
                    }`}
                  >
                    {file.change_type}
                  </span>
                  <span>{file.file_path}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                className={`btn btn-sm ${
                  file.change_type === 'create' ? 'btn-success' : 'btn-warning'
                }`}
                onClick={handleFileActionClick}
                title={
                  file.change_type === 'create'
                    ? 'Preview and create new file'
                    : 'Preview changes and update existing file'
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {file.change_type === 'create' ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  )}
                </svg>
                {file.change_type === 'create'
                  ? 'Preview & Create'
                  : 'Preview & Update'}
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onCopy(file.code)}
                title="Copy code to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* File Description */}
        <div className="px-4 py-2 bg-base-100 border-b border-base-300">
          <p className="text-sm text-base-content/70">{file.description}</p>
        </div>

        {/* Code Content */}
        <div className="bg-base-200">
          <pre className="px-4 py-3 overflow-x-auto text-sm max-h-96 text-base-content">
            <code>{file.code}</code>
          </pre>
        </div>
      </div>

      {/* Diff Modal */}
      <DiffModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
        file={file}
        onConfirm={handleConfirmAction}
      />
    </>
  )
}

export default CodeFileCard
