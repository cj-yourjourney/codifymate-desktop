import React, { useState, useEffect } from 'react'
import { FolderOpen, Plus, Check, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import {
  analyzeRelevantFiles,
  setProjectPath,
  setProjectFiles,
  addSelectedFile,
  removeSelectedFile,
  clearRelevantFiles,
  clearError,
  resetState
} from './state/relevantFilesSlice'
import { generateCode } from '@/features/aiCodeAssistant/codeGeneration/state/codeGenerationSlice'

interface Step2RelevantFilesProps {
  onContinue?: () => void
}

const Step2RelevantFiles: React.FC<Step2RelevantFilesProps> = ({
  onContinue
}) => {
  const dispatch = useAppDispatch()
  const {
    projectPath,
    projectFiles,
    aiRecommendedFiles,
    relevantFiles,
    projectStructure,
    error
  } = useAppSelector((state) => state.relevantFiles)

  const { user_prompt } = useAppSelector((state) => state.promptAssessment)
  const { isGenerating } = useAppSelector((state) => state.codeGeneration)
  const [loading, setLoading] = useState('')

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 3000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  const handleSelectFolder = async () => {
    setLoading('folder')
    try {
      const selectedPath = await window.electronAPI.selectFolder()
      if (selectedPath) {
        dispatch(setProjectPath(selectedPath))
        const files = await window.electronAPI.getProjectFiles(selectedPath)
        dispatch(setProjectFiles(files))
        dispatch(clearRelevantFiles())
      }
    } finally {
      setLoading('')
    }
  }

  const handleAnalyze = () => {
    dispatch(
      analyzeRelevantFiles({
        user_prompts: user_prompt,
        project_file_paths: projectFiles
      })
    )
  }

  const handleToggle = async (filePath: string) => {
    if (relevantFiles.some((file) => file.file_path === filePath)) {
      dispatch(removeSelectedFile(filePath))
    } else {
      setLoading(filePath)
      try {
        const content = await window.electronAPI.readFileContent(filePath)
        dispatch(addSelectedFile({ file_path: filePath, content }))
      } finally {
        setLoading('')
      }
    }
  }

  const handleAddFiles = async () => {
    try {
      const paths = await window.electronAPI.selectFiles()
      for (const path of paths) {
        if (!relevantFiles.some((file) => file.file_path === path)) {
          setLoading(path)
          const content = await window.electronAPI.readFileContent(path)
          dispatch(addSelectedFile({ file_path: path, content }))
        }
      }
    } finally {
      setLoading('')
    }
  }

  const handleContinue = () => {
    const requestPayload = {
      user_prompt,
      relevant_files: relevantFiles,
      project_structure: projectStructure || { directories: {} }
    }

    console.log('Request Payload:', requestPayload)

    // Dispatch the generateCode action
    dispatch(generateCode(requestPayload))

    // Navigate to Step 3
    onContinue?.()
  }

  const fileName = (path: string) => path.split('/').pop() || path
  const allFiles = [
    ...new Set([
      ...aiRecommendedFiles,
      ...relevantFiles.map((f) => f.file_path)
    ])
  ]

  if (!projectPath) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white rounded-lg border p-8 text-center">
          <FolderOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Select Project</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose your project folder
          </p>
          <button
            onClick={handleSelectFolder}
            disabled={loading === 'folder'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading === 'folder' ? 'Loading...' : 'Select Folder'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 flex justify-between items-center">
          <span className="text-red-700 text-sm">{error}</span>
          <X
            className="w-4 h-4 text-red-500 cursor-pointer"
            onClick={() => dispatch(clearError())}
          />
        </div>
      )}

      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-medium">{fileName(projectPath)}</h3>
            <p className="text-sm text-gray-500">{projectFiles.length} files</p>
          </div>
          <button
            onClick={() => dispatch(resetState())}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Change
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleAnalyze}
            disabled={!user_prompt}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Analyze
          </button>
          <button
            onClick={handleAddFiles}
            title="Add files manually"
            className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {allFiles.length > 0 && (
          <>
            <div className="space-y-1 mb-4">
              {allFiles.map((path) => {
                const selected = relevantFiles.some(
                  (file) => file.file_path === path
                )
                const isLoading = loading === path
                const aiSuggested = aiRecommendedFiles.includes(path)

                return (
                  <div
                    key={path}
                    onClick={() => !isLoading && handleToggle(path)}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      selected ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span>{aiSuggested ? '⭐' : '📄'}</span>
                      <span className="text-sm truncate">{fileName(path)}</span>
                    </div>
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selected && <Check className="w-2 h-2 text-white" />}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {relevantFiles.length > 0 && (
              <button
                onClick={handleContinue}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isGenerating
                  ? 'Generating...'
                  : `Continue (${relevantFiles.length})`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Step2RelevantFiles
