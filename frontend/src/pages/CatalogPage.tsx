import { useEffect, useState } from 'react'
import api from '../utils/api'

interface Product {
  id: string
  name: string
  sku: string
  price_per_meter: number
  description?: string
  category_id: string
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/catalog/products')
      setProducts(response.data.data || [])
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки каталога')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>
  }

  return (
    <div className="catalog-page">
      <h1 className="text-3xl font-bold mb-8">Каталог тканей и фурнитуры</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{product.sku}</p>
            <p className="text-blue-600 font-bold text-lg mb-4">
              ₽{product.price_per_meter}/м
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Добавить в корзину
            </button>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-600">Товары не найдены</p>
      )}
    </div>
  )
}
