// Create this as a temporary test component to verify React events work
import React from 'react'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import { generateCode } from '@/features/aiCodeAssistant/codeGeneration/state/codeGenerationSlice'

const DebugTest: React.FC = () => {
  const dispatch = useAppDispatch()
  const codeGenerationState = useAppSelector((state) => state.codeGeneration)

  const testGenerateCode = async () => {
    console.log('🧪 TEST: Button clicked!')
    console.log('🧪 TEST: Redux state:', codeGenerationState)

    try {
      console.log('🧪 TEST: Dispatching generateCode...')

      const result = await dispatch(
        generateCode({
          userPrompt: 'Test prompt',
          clarifyingQuestionsWithAnswers: [
            { question: 'Test?', answer: 'Yes' }
          ],
          selectedRelevantFiles: [],
          manuallyAddedFiles: [],
          additionalNotes: 'Test notes',
          projectStructure: {
            type: 'test',
            root: '.',
            structure: { root_files: [] },
            conventions: {},
            framework: {}
          }
        })
      ).unwrap()

      console.log('🧪 TEST: Success!', result)
    } catch (error) {
      console.error('🧪 TEST: Error:', error)
    }
  }

  return (
    <div
      style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}
    >
      <h2>Debug Test Component</h2>
      <button
        onClick={testGenerateCode}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Test Generate Code
      </button>
      <div style={{ marginTop: '10px' }}>
        <strong>Loading:</strong> {codeGenerationState.loading ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Error:</strong> {codeGenerationState.error || 'None'}
      </div>
    </div>
  )
}

export default DebugTest
