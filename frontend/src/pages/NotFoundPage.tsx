import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Страница не найдена</p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
        >
          На главную
        </Link>
      </div>
    </div>
  )
}
