import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

interface CartItem {
  product_id: string
  product_name: string
  meters: number
  price_per_meter: number
}

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const total = cart.reduce((sum, item) => sum + (item.meters * item.price_per_meter), 0)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Корзина пуста')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/orders', { items: cart })
      
      alert(`Заказ создан: ${response.data.data.public_id}`)
      setCart([])
      navigate('/orders')
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Ошибка при создании заказа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cart-page">
      <h1 className="text-3xl font-bold mb-8">Корзина</h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600 py-12">
          Корзина пуста. <a href="/catalog" className="text-blue-600 underline">Перейти в каталог</a>
        </p>
      ) : (
        <div>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Товар</th>
                  <th className="border p-3 text-right">Метры</th>
                  <th className="border p-3 text-right">Цена/м</th>
                  <th className="border p-3 text-right">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx} className="border">
                    <td className="border p-3">{item.product_name}</td>
                    <td className="border p-3 text-right">{item.meters}</td>
                    <td className="border p-3 text-right">₽{item.price_per_meter}</td>
                    <td className="border p-3 text-right">₽{item.meters * item.price_per_meter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right mb-8">
            <p className="text-2xl font-bold">
              Итого: ₽{total.toFixed(2)}
            </p>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="bg-blue-600 text-white py-3 px-8 rounded text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Оформление...' : 'Оформить заказ'}
          </button>
        </div>
      )}
    </div>
  )
}
