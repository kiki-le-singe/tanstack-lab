import { useState } from 'react'
import { Button } from '@/components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">TanStack Lab</h1>
        <div className="space-y-4">
          <Button onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </Button>
          <p className="text-gray-600">
            Ready for TanStack Router, Query & DB! ✨
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
