import { useState, useEffect } from 'react';
import { productAPI } from '../services/product.service';
import { saleAPI } from '../services/sale.service';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cashReceived, setCashReceived] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productAPI.getAll();
      setProducts(data.filter(p => p.stock > 0));
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Stock máximo disponible');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.salePrice),
        cost: parseFloat(product.costPrice),
        stock: product.stock,
        quantity: 1,
        image: product.image
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    const product = products.find(p => p.id === productId);
    if (quantity > product.stock) {
      toast.error('Stock máximo disponible');
      return;
    }
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setCashReceived('');
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCost = cart.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
  const profit = subtotal - totalCost;
  const total = subtotal;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Agrega productos al carrito');
      return;
    }

    if (paymentMethod === 'CASH' && (!cashReceived || parseFloat(cashReceived) <= 0)) {
      toast.error('Ingresa el efectivo recibido');
      return;
    }

    if (paymentMethod === 'CASH' && parseFloat(cashReceived) < total) {
      toast.error('El efectivo recibido es insuficiente');
      return;
    }

    setProcessing(true);

    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        paymentMethod,
        tax: 0
      };

      const response = await saleAPI.create(saleData);
      
      setLastSale({
        ...response.sale,
        subtotalNum: parseFloat(response.sale.subtotal),
        totalNum: parseFloat(response.sale.total),
        change: paymentMethod === 'CASH' ? parseFloat(cashReceived) - parseFloat(response.sale.total) : 0
      });
      setShowReceipt(true);
      toast.success('¡Venta realizada exitosamente!');
      clearCart();
      loadProducts();
    } catch (error) {
      console.error('Error en venta:', error);
      const errorMsg = error.response?.data?.error || 'Error al procesar la venta';
      toast.error(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setLastSale(null);
  };

  // Vista del ticket
  if (showReceipt && lastSale) {
    const subtotalVal = lastSale.subtotalNum || 0;
    const totalVal = lastSale.totalNum || 0;
    const changeVal = lastSale.change || 0;

    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <img src="/assets/logo.png" alt="MOTOMASTER YOH" className="h-20 mx-auto mb-2" onError={(e) => e.target.style.display='none'} />
            <h2 className="text-2xl font-black text-gray-800">MOTOMASTER YOH</h2>
            <p className="text-sm text-gray-600">Refaccionaria y Taller</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(lastSale.createdAt).toLocaleString('es-MX')}
            </p>
          </div>

          <div className="border-t border-b border-gray-300 py-4 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-bold">
                  <th className="py-2">Producto</th>
                  <th className="py-2 text-center">Cant</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {lastSale.items && lastSale.items.map((item, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="py-2">{item.product?.name || 'Producto'}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right font-bold">
                      ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-bold">${subtotalVal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-red-600">
              <span>TOTAL:</span>
              <span>${totalVal.toFixed(2)}</span>
            </div>
            {paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Efectivo:</span>
                  <span>${parseFloat(cashReceived).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-bold">
                  <span>Cambio:</span>
                  <span>${changeVal.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="text-center text-xs text-gray-500 mb-4">
            <p>¡Gracias por su compra!</p>
            <p>Vuelva pronto</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={printReceipt}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              🖨️ Imprimir
            </button>
            <button
              onClick={closeReceipt}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
            >
              Nueva Venta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista normal del POS
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-black via-gray-900 to-red-900 shadow-lg border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/assets/logo.png" alt="Logo" className="h-16 w-auto" onError={(e) => e.target.style.display='none'} />
            <div className="border-l-2 border-red-500 pl-4">
              <h1 className="text-2xl font-black text-white">MOTOMASTER YOH</h1>
              <p className="text-xs text-red-400">🛒 Punto de Venta</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
          >
            ← Volver
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-100px)]">
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <input
              type="text"
              placeholder="🔍 Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-lg"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-6xl mb-4"></div>
                <p>No hay productos disponibles</p>
                <p className="text-sm">Agrega productos desde el inventario</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition text-left"
                  >
                    {product.image ? (
                      <img src={`http://localhost:3000${product.image}`} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-4xl"></div>
                    )}
                    <h3 className="font-bold text-sm mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{product.code}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-red-600">${parseFloat(product.salePrice).toFixed(2)}</span>
                      <span className="text-xs px-2 py-1 rounded-full font-bold bg-green-100 text-green-800">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-96 bg-white shadow-2xl flex flex-col border-l-4 border-red-600">
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-4">
            <h2 className="text-xl font-black uppercase">🛒 Carrito</h2>
            <p className="text-xs text-red-200">{cart.length} productos</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-6xl mb-4"></div>
                <p>Carrito vacío</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm flex-1">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-600 ml-2">✕</button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="bg-gray-300 w-8 h-8 rounded font-bold">-</button>
                        <span className="font-bold w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="bg-gray-300 w-8 h-8 rounded font-bold">+</button>
                      </div>
                      <span className="font-black text-red-600">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t-4 border-gray-300 p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-2xl font-black text-red-600">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Ganancia:</span>
                <span className="font-bold">${profit.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Método de Pago:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              >
                <option value="CASH">💵 Efectivo</option>
                <option value="CARD">💳 Tarjeta</option>
                <option value="CREDIT">📝 Crédito</option>
              </select>
            </div>

            {paymentMethod === 'CASH' && (
              <div>
                <label className="block text-sm font-bold mb-2">Efectivo Recibido:</label>
                <input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-lg font-bold"
                  placeholder="$0.00"
                />
                {parseFloat(cashReceived) > total && (
                  <p className="text-sm text-green-600 mt-1 font-bold">
                    Cambio: ${(parseFloat(cashReceived) - total).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={clearCart} disabled={cart.length === 0} className="flex-1 bg-gray-300 py-3 rounded-lg font-bold disabled:opacity-50">
                🗑️ Limpiar
              </button>
              <button
                onClick={processSale}
                disabled={cart.length === 0 || processing}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
              >
                {processing ? '...' : '💰 Cobrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
