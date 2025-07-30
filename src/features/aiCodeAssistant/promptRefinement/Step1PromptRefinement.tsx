// components/Step1PromptRefinement.tsx (updated)
import React from 'react'
import { Edit3, Folder, FileText, RefreshCw, Info } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/shared/store/hook'
import {
  setUserPrompt,
  setSelectedFolder,
  getProjectFiles
} from './state/promptRefinementSlice'

const Step1PromptRefinement: React.FC = () => {
  const dispatch = useAppDispatch()
  const { userPrompt, selectedFolder, projectFilePaths, loading, error } =
    useAppSelector((state) => state.promptRefinement)

  const handleSelectFolder = async () => {
    try {
      const folderPath = await window.electronAPI.selectFolder()
      if (folderPath) {
        dispatch(setSelectedFolder(folderPath))
        // Automatically get project files when folder is selected
        dispatch(getProjectFiles(folderPath))
      }
    } catch (error) {
      console.error('Error selecting folder:', error)
    }
  }

  const handleFolderInputChange = (value: string) => {
    dispatch(setSelectedFolder(value))
  }

  const handleGetProjectFiles = () => {
    if (selectedFolder) {
      dispatch(getProjectFiles(selectedFolder))
    }
  }

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="alert alert-error shadow-lg">
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Prompt Input Section */}
      <div className="card bg-base-100 shadow-lg border border-base-200">
        <div className="card-body p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <Edit3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content">
                Describe Your Project
              </h3>
              <p className="text-sm text-base-content/60">
                Tell us what you want to build
              </p>
            </div>
          </div>

          <div className="form-control">
            <textarea
              className="textarea textarea-bordered h-32 text-base resize-none focus:textarea-primary transition-colors"
              placeholder="e.g., Create a user authentication component with form validation, password strength indicator, and integration with our existing API..."
              value={userPrompt}
              onChange={(e) => dispatch(setUserPrompt(e.target.value))}
            />
            {/* Fixed label positioning with proper spacing */}
            <div className="flex justify-between items-center mt-2 px-1">
              <span className="text-xs text-base-content/50">
                {userPrompt.length} characters
              </span>
              <span className="text-xs text-base-content/50">
                💡 Be specific for better results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Folder Section */}
      <div className="card bg-base-100 shadow-lg border border-base-200">
        <div className="card-body p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <Folder className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content">
                Project Location
              </h3>
              <p className="text-sm text-base-content/60">
                Select your project folder
              </p>
            </div>
          </div>

          <div className="form-control">
            <div className="join w-full">
              <input
                type="text"
                className="input input-bordered join-item flex-1 focus:input-secondary transition-colors"
                placeholder="/path/to/your/project"
                value={selectedFolder}
                onChange={(e) => handleFolderInputChange(e.target.value)}
              />
              <button
                className="btn btn-primary join-item px-6"
                onClick={handleSelectFolder}
                disabled={loading}
              >
                <Folder className="w-4 h-4 mr-2" />
                Browse
              </button>
            </div>

            {selectedFolder && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-base-content/60">
                  Selected: {selectedFolder}
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleGetProjectFiles}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Files
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Files Display */}
      {projectFilePaths.length > 0 && (
        <div className="card bg-base-100 shadow-lg border border-base-200">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-base-content">
                    Project Files
                  </h3>
                  <p className="text-sm text-base-content/60">
                    Found {projectFilePaths.length} files
                  </p>
                </div>
              </div>
              <div className="badge badge-primary badge-lg">
                {projectFilePaths.length} files
              </div>
            </div>

            <div className="bg-base-50 rounded-lg border border-base-200 max-h-64 overflow-y-auto">
              <div className="p-4 space-y-2">
                {projectFilePaths.slice(0, 15).map((filePath, index) => (
                  <div
                    key={index}
                    className="flex items-center py-2 px-3 bg-base-100 rounded-md border border-base-200/50"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center mr-3">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-base-content truncate">
                        {filePath.split('/').pop()}
                      </div>
                      <div className="text-xs text-base-content/50 truncate">
                        {filePath}
                      </div>
                    </div>
                  </div>
                ))}

                {projectFilePaths.length > 15 && (
                  <div className="text-center py-4">
                    <div className="text-sm text-base-content/60 bg-base-200 rounded-lg py-2 px-4 inline-block">
                      ... and {projectFilePaths.length - 15} more files
                    </div>
                  </div>
                )}
              </div>
            </div>

            {projectFilePaths.length > 0 && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-primary mr-2 mt-0.5" />
                  <div className="text-sm text-primary">
                    <div className="font-medium">Ready for analysis</div>
                    <div className="text-primary/80">
                      Your project files have been scanned and are ready for AI
                      analysis.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Step1PromptRefinement
