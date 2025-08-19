import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { User } from '@tanstack-lab/shared'
import { apiClient } from '@/lib/api/client'

export const Route = createFileRoute('/users')({
  component: Users,
})

function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        const response = await apiClient.getUsers({ page: 1, limit: 10 })
        if (response.success) {
          setUsers(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Users</h2>
        <p className="text-gray-600">Loading users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Users</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error}</p>
          <p className="text-sm text-red-600 mt-2">
            Make sure your server is running on http://localhost:3000
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Users</h2>
        <Button>Add User</Button>
      </div>
      
      {users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No users found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/users/${user.id}`}>View Details</a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          ✅ Using shared types from <code>@tanstack-lab/shared</code>
        </p>
      </div>
    </div>
  )
}