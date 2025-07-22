// components/Step1PromptRefinement.tsx (updated)
import React from 'react'

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
    <div className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">
            Describe what you want to build
          </span>
        </label>
        <textarea
          className="textarea textarea-bordered h-32 resize-none"
          placeholder="e.g., Create a user authentication component with form validation..."
          value={userPrompt}
          onChange={(e) => dispatch(setUserPrompt(e.target.value))}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Project Folder</span>
        </label>
        <div className="join w-full">
          <input
            type="text"
            className="input input-bordered join-item flex-1"
            placeholder="/path/to/your/project"
            value={selectedFolder}
            onChange={(e) => handleFolderInputChange(e.target.value)}
          />
          <button
            className="btn btn-outline join-item"
            onClick={handleSelectFolder}
            disabled={loading}
          >
            📁
          </button>
        </div>
        {selectedFolder && (
          <div className="mt-2">
            <button
              className="btn btn-sm btn-secondary"
              onClick={handleGetProjectFiles}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Scanning Files...
                </>
              ) : (
                'Refresh Project Files'
              )}
            </button>
          </div>
        )}
      </div>

      {projectFilePaths.length > 0 && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Project Files Found ({projectFilePaths.length})
            </span>
          </label>
          <div className="bg-base-200 p-4 rounded-lg max-h-40 overflow-y-auto">
            <div className="text-sm space-y-1">
              {projectFilePaths.slice(0, 10).map((filePath, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-base-content/60 mr-2">📄</span>
                  <span className="truncate">{filePath}</span>
                </div>
              ))}
              {projectFilePaths.length > 10 && (
                <div className="text-base-content/60 text-center py-2">
                  ... and {projectFilePaths.length - 10} more files
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Step1PromptRefinement
