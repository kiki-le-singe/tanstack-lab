import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users')({
  component: Users,
})

function Users() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Users</h2>
      <p className="text-gray-600">
        User list will be displayed here with TanStack Query integration coming next!
      </p>
    </div>
  )
}