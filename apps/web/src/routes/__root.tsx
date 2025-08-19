import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-4 bg-white shadow-sm border-b">
        <div className="flex gap-4 items-center max-w-6xl mx-auto">
          <h1 className="text-xl font-bold">TanStack Lab</h1>
          <nav className="flex gap-4">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <Link to="/users" className="text-blue-600 hover:text-blue-800">
              Users
            </Link>
            <Link to="/posts" className="text-blue-600 hover:text-blue-800">
              Posts
            </Link>
          </nav>
        </div>
      </div>
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
})