import { useEffect, useState } from 'react'
import api from '../utils/api'

interface Order {
  id: string
  public_id: string
  status: string
  total_amount: number
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/orders')
      setOrders(response.data.data || [])
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки заказов')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="py-12">Загрузка...</div>
  if (error) return <div className="py-12 text-red-600">{error}</div>

  return (
    <div className="orders-page">
      <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">У вас нет заказов</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">№ Заказа</th>
                <th className="border p-3 text-left">Статус</th>
                <th className="border p-3 text-right">Сумма</th>
                <th className="border p-3 text-left">Дата</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border hover:bg-gray-50">
                  <td className="border p-3 font-semibold">{order.public_id}</td>
                  <td className="border p-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                      {order.status}
                    </span>
                  </td>
                  <td className="border p-3 text-right">₽{order.total_amount}</td>
                  <td className="border p-3">{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
