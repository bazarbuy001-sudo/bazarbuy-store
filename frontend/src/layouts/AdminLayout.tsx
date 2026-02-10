import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    // Admin panel is a placeholder for now
    navigate('/login')
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-100">
      <p className="text-center py-12">Admin panel coming soon...</p>
    </div>
  )
}
