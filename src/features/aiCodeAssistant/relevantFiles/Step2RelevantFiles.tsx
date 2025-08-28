import React, { useState, useEffect } from 'react'
import {
  FolderOpen,
  FileText,
  BarChart3,
  Plus,
  Check,
  X,
  FileIcon
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import {
  analyzeRelevantFiles,
  setProjectPath,
  setProjectFiles,
  addSelectedFile,
  removeSelectedFile,
  clearRelevantFiles,
  clearError,
  resetState,
  SelectedFile
} from './state/relevantFilesSlice'

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
    isAnalyzing,
    error
  } = useAppSelector((state) => state.relevantFiles)

  const { user_prompt } = useAppSelector((state) => state.promptAssessment)

  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [isLoadingContent, setIsLoadingContent] = useState<
    Record<string, boolean>
  >({})

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  // Handle folder selection
  const handleSelectFolder = async () => {
    try {
      setIsLoadingFiles(true)
      const selectedPath = await window.electronAPI.selectFolder()

      if (selectedPath) {
        dispatch(setProjectPath(selectedPath))
        const files = await window.electronAPI.getProjectFiles(selectedPath)
        dispatch(setProjectFiles(files))
        dispatch(clearRelevantFiles())
      }
    } catch (err) {
      console.error('Error selecting folder:', err)
    } finally {
      setIsLoadingFiles(false)
    }
  }

  // Handle file analysis
  const handleAnalyzeFiles = async () => {
    if (!user_prompt || projectFiles.length === 0) {
      return
    }

    const requestData = {
      user_prompts: user_prompt,
      project_file_paths: projectFiles
    }

    dispatch(analyzeRelevantFiles(requestData))
  }

  // Handle selecting/deselecting AI recommended files
  const handleToggleAiFile = async (filePath: string) => {
    const isSelected = relevantFiles.some((file) => file.file_path === filePath)

    if (isSelected) {
      dispatch(removeSelectedFile(filePath))
    } else {
      setIsLoadingContent((prev) => ({ ...prev, [filePath]: true }))
      try {
        const content = await window.electronAPI.readFileContent(filePath)
        const selectedFile: SelectedFile = {
          file_path: filePath,
          content: content
        }
        dispatch(addSelectedFile(selectedFile))
      } catch (err) {
        console.error('Error reading file content:', err)
      } finally {
        setIsLoadingContent((prev) => ({ ...prev, [filePath]: false }))
      }
    }
  }

  // Handle manual file selection
  const handleSelectManualFiles = async () => {
    try {
      const selectedFilePaths = await window.electronAPI.selectFiles()

      for (const filePath of selectedFilePaths) {
        const isAlreadySelected = relevantFiles.some(
          (file) => file.file_path === filePath
        )
        if (!isAlreadySelected) {
          setIsLoadingContent((prev) => ({ ...prev, [filePath]: true }))
          try {
            const content = await window.electronAPI.readFileContent(filePath)
            const selectedFile: SelectedFile = {
              file_path: filePath,
              content: content
            }
            dispatch(addSelectedFile(selectedFile))
          } catch (err) {
            console.error('Error reading file content:', err)
          } finally {
            setIsLoadingContent((prev) => ({ ...prev, [filePath]: false }))
          }
        }
      }
    } catch (err) {
      console.error('Error selecting files:', err)
    }
  }

  // Handle continue button
  const handleContinue = () => {
    const requestPayload = {
      user_prompt: user_prompt,
      relevant_files: relevantFiles,
      project_structure: projectStructure
    }

    console.log('Request Payload for Code Generation:', requestPayload)

    if (onContinue) {
      onContinue()
    }
  }

  const handleReset = () => {
    dispatch(resetState())
  }

  const getFileIcon = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase()
    const iconMap: Record<string, string> = {
      tsx: '⚛️',
      ts: '📘',
      jsx: '⚛️',
      js: '📄',
      json: '📋',
      css: '🎨',
      scss: '🎨',
      html: '🌐',
      md: '📝',
      py: '🐍',
      java: '☕',
      cpp: '⚙️'
    }
    return iconMap[ext || ''] || '📄'
  }

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || filePath
  }

  const getRelativePath = (filePath: string, basePath: string) => {
    if (basePath && filePath.startsWith(basePath)) {
      return filePath.substring(basePath.length + 1)
    }
    return filePath
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => dispatch(clearError())}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Project Selection */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Project Setup
          </h3>

          {!projectPath ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                Select your project folder to get started
              </p>
              <button
                onClick={handleSelectFolder}
                disabled={isLoadingFiles}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoadingFiles ? 'Loading...' : 'Select Folder'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {projectPath.split('/').pop()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {projectFiles.length} files found
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAnalyzeFiles}
                  disabled={
                    !user_prompt || projectFiles.length === 0 || isAnalyzing
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Files'}
                </button>

                <button
                  onClick={handleSelectManualFiles}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Files
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File Selection */}
        {(aiRecommendedFiles.length > 0 || relevantFiles.length > 0) && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                File Selection
              </h3>
              <div className="text-sm text-gray-600">
                {relevantFiles.length} selected
              </div>
            </div>

            {/* AI Recommended Files */}
            {aiRecommendedFiles.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  AI recommended files ({aiRecommendedFiles.length}):
                </p>
                <div className="space-y-2">
                  {aiRecommendedFiles.map((filePath, index) => {
                    const isSelected = relevantFiles.some(
                      (file) => file.file_path === filePath
                    )
                    const isLoading = isLoadingContent[filePath]

                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() =>
                          !isLoading && handleToggleAiFile(filePath)
                        }
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span>{getFileIcon(filePath)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getFileName(filePath)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {getRelativePath(filePath, projectPath || '')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                          ) : (
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Manual Files */}
            {relevantFiles.some(
              (file) => !aiRecommendedFiles.includes(file.file_path)
            ) && (
              <div className="space-y-3 mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Manually selected files:
                </p>
                <div className="space-y-2">
                  {relevantFiles
                    .filter(
                      (file) => !aiRecommendedFiles.includes(file.file_path)
                    )
                    .map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span>{getFileIcon(file.file_path)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getFileName(file.file_path)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {getRelativePath(
                                file.file_path,
                                projectPath || ''
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            dispatch(removeSelectedFile(file.file_path))
                          }
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={handleContinue}
                disabled={relevantFiles.length === 0 || !user_prompt}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Continue with {relevantFiles.length} file
                {relevantFiles.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!projectPath && (
          <div className="text-center text-sm text-gray-500">
            Select a project folder to analyze relevant files for your prompt
          </div>
        )}

        {projectPath && projectFiles.length === 0 && (
          <div className="text-center text-sm text-gray-500">
            No supported files found in the selected folder
          </div>
        )}

        {projectFiles.length > 0 && !user_prompt && (
          <div className="text-center text-sm text-gray-500">
            Complete Step 1 to analyze relevant files
          </div>
        )}
      </div>
    </div>
  )
}

export default Step2RelevantFiles
