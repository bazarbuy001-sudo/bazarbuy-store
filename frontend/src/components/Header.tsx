import { Link, useNavigate } from 'react-router-dom'

interface HeaderProps {
  showNav?: boolean
  onLogout?: () => void
}

export default function Header({ showNav = true, onLogout }: HeaderProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_email')
    if (onLogout) onLogout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Bazar Buy
        </Link>

        {showNav && (
          <div className="flex gap-8">
            <Link
              to="/catalog"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Каталог
            </Link>
            <Link
              to="/cart"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Корзина
            </Link>
            <Link
              to="/orders"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Заказы
            </Link>
          </div>
        )}

        {showNav && (
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
          >
            Выход
          </button>
        )}
      </nav>
    </header>
  )
}
