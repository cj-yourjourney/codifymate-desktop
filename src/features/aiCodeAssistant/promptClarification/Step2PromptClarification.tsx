import React from 'react'

interface Question {
  id: string
  question: string
  answer: string
}

interface FileReference {
  path: string
  relevant: boolean
}

interface Step2Props {
  questions: Question[]
  fileReferences: FileReference[]
}

const Step2PromptClarification: React.FC<Step2Props> = ({
  questions,
  fileReferences
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Questions from AI</h3>
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="card bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <p className="font-medium mb-3">{q.question}</p>
                <textarea
                  className="textarea textarea-bordered textarea-sm resize-none"
                  rows={2}
                  placeholder="Your answer..."
                  defaultValue={q.answer}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Relevant Files</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {fileReferences.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
            >
              <div className="flex items-center flex-1">
                <span className="text-base-content/60 mr-3">📄</span>
                <span className="text-sm truncate">{file.path}</span>
              </div>
              <input
                type="checkbox"
                defaultChecked={file.relevant}
                className="checkbox checkbox-primary checkbox-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Step2PromptClarification
