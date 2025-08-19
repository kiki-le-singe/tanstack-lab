import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: PostDetail,
})

function PostDetail() {
  const { postId } = Route.useParams()
  
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Post Detail: {postId}
      </h2>
      <p className="text-gray-600">
        Post details will be displayed here with TanStack Query integration coming next!
      </p>
    </div>
  )
}