import React from 'react'

interface Step1Props {
  userPrompt: string
  selectedFolder: string
  setUserPrompt: (value: string) => void
  setSelectedFolder: (value: string) => void
}

const Step1PromptRefinement: React.FC<Step1Props> = ({
  userPrompt,
  selectedFolder,
  setUserPrompt,
  setSelectedFolder
}) => {
  return (
    <div className="space-y-6">
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
          onChange={(e) => setUserPrompt(e.target.value)}
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
            onChange={(e) => setSelectedFolder(e.target.value)}
          />
          <button className="btn btn-outline join-item">📁</button>
        </div>
      </div>
    </div>
  )
}

export default Step1PromptRefinement
