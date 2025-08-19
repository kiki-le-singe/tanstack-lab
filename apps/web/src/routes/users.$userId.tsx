import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { UserWithRelations } from '@tanstack-lab/shared'
import { apiClient } from '@/lib/api/client'

export const Route = createFileRoute('/users/$userId')({
  component: UserDetail,
})

function UserDetail() {
  const { userId } = Route.useParams()
  const [user, setUser] = useState<UserWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true)
        const response = await apiClient.getUser(userId)
        if (response.success) {
          setUser(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">User Details</h2>
        <p className="text-gray-600">Loading user...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">User Details</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error || 'User not found'}</p>
          <p className="text-sm text-red-600 mt-2">
            Make sure your server is running and the user exists
          </p>
        </div>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <a href="/users">← Back to Users</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">User Details</h2>
        <Button variant="outline" asChild>
          <a href="/users">← Back to Users</a>
        </Button>
      </div>

      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{user.name}</h3>
            <p className="text-gray-500">
              User ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{user.id}</code>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Profile Information</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Created:</span> {new Date(user.createdAt).toLocaleString()}</p>
              <p><span className="text-gray-500">Avatar:</span> {user.avatarUrl || 'No avatar set'}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Activity</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Posts:</span> {user.posts?.length || 0}</p>
              <p><span className="text-gray-500">Comments:</span> {user.comments?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Button>Edit User</Button>
          <Button variant="outline">View Posts</Button>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          ✅ Using shared types with relations from <code>@tanstack-lab/shared</code>
        </p>
      </div>
    </div>
  )
}