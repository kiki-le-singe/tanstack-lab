import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to TanStack Lab! 🚀
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          A modern full-stack application built with TanStack Router, Query, and DB
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <a href="/users">Explore Users</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/posts">Browse Posts</a>
          </Button>
        </div>
      </div>
    </div>
  )
}