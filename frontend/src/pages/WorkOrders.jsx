import { useState, useEffect } from 'react';
import { workOrderAPI } from '../services/workorder.service';
import { productAPI } from '../services/product.service';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    motorcycleBrand: '',
    motorcycleModel: '',
    motorcycleYear: '',
    motorcyclePlate: '',
    mechanicId: '',
    problemDescription: '',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([
        workOrderAPI.getAll(),
        productAPI.getAll()
      ]);
      setWorkOrders(ordersData);
      setProducts(productsData.filter(p => p.stock > 0));
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      motorcycleBrand: '',
      motorcycleModel: '',
      motorcycleYear: '',
      motorcyclePlate: '',
      mechanicId: '',
      problemDescription: '',
      priority: 'MEDIUM'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Primero crear cliente
      const customerResponse = await fetch('http://localhost:3000/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.customerName,
          phone: formData.customerPhone
        })
      });
      const customer = await customerResponse.json();

      // Crear moto
      const motorcycleResponse = await fetch('http://localhost:3000/api/motorcycles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          customerId: customer.id,
          brand: formData.motorcycleBrand,
          model: formData.motorcycleModel,
          year: formData.motorcycleYear ? parseInt(formData.motorcycleYear) : null,
          plate: formData.motorcyclePlate
        })
      });
      const motorcycle = await motorcycleResponse.json();

      // Crear orden
      await workOrderAPI.create({
        motorcycleId: motorcycle.id,
        customerId: customer.id,
        mechanicId: formData.mechanicId,
        problemDescription: formData.problemDescription,
        priority: formData.priority
      });

      toast.success('Orden de trabajo creada exitosamente');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al crear la orden');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await workOrderAPI.updateStatus(orderId, newStatus);
      toast.success(`Estado actualizado a: ${newStatus}`);
      loadData();
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleViewDetail = async (orderId) => {
    try {
      const order = await workOrderAPI.getById(orderId);
      setSelectedOrder(order);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Error al cargar la orden');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      RECEIVED: 'bg-blue-100 text-blue-800',
      DIAGNOSING: 'bg-yellow-100 text-yellow-800',
      REPAIRING: 'bg-orange-100 text-orange-800',
      READY: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      RECEIVED: ' Recibida',
      DIAGNOSING: '🔍 Diagnóstico',
      REPAIRING: '🔧 En Reparación',
      READY: '✅ Lista',
      DELIVERED: '📤 Entregada'
    };
    return labels[status] || status;
  };

  const filteredOrders = workOrders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab.toUpperCase();
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-red-900 shadow-lg border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/assets/logo.png" alt="Logo" className="h-16 w-auto" onError={(e) => e.target.style.display='none'} />
            <div className="border-l-2 border-red-500 pl-4">
              <h1 className="text-2xl font-black text-white">MOTOMASTER YOH</h1>
              <p className="text-xs text-red-400">🔧 Órdenes de Trabajo</p>
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

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Barra de herramientas */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            {['all', 'RECEIVED', 'DIAGNOSING', 'REPAIRING', 'READY', 'DELIVERED'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  activeTab === tab
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {tab === 'all' ? 'Todas' : getStatusLabel(tab)}
              </button>
            ))}
          </div>
          <button
            onClick={handleOpenModal}
            className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-2 rounded-lg font-bold hover:from-red-700 hover:to-red-900 transition shadow-lg"
          >
            ➕ Nueva Orden
          </button>
        </div>

        {/* Lista de órdenes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando órdenes...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <p>No hay órdenes de trabajo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-900 to-red-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Folio</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Motocicleta</th>
                    <th className="px-4 py-3 text-left">Mecánico</th>
                    <th className="px-4 py-3 text-left">Problema</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-center">Prioridad</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{order.customer?.name}</div>
                        <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{order.motorcycle?.brand} {order.motorcycle?.model}</div>
                        <div className="text-xs text-gray-500">
                          {order.motorcycle?.year} - {order.motorcycle?.plate || 'Sin placa'}
                        </div>
                      </td>
                      <td className="px-4 py-3">{order.mechanic?.name || 'Sin asignar'}</td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">
                        {order.problemDescription}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                          order.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          order.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewDetail(order.id)}
                          className="text-blue-600 hover:text-blue-800 mx-1"
                          title="Ver detalle"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Nueva Orden */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-gray-900 to-red-900 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-black text-white uppercase">
                🔧 Nueva Orden de Trabajo
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-red-300 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Datos del cliente */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-red-600 pb-2">
                  👤 Datos del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="9931234567"
                    />
                  </div>
                </div>
              </div>

              {/* Datos de la moto */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-red-600 pb-2">
                  🏍️ Datos de la Motocicleta
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Marca *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.motorcycleBrand}
                      onChange={(e) => setFormData({...formData, motorcycleBrand: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ej: Honda, Yamaha"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Modelo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.motorcycleModel}
                      onChange={(e) => setFormData({...formData, motorcycleModel: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ej: CB190, FZ25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Año
                    </label>
                    <input
                      type="number"
                      value={formData.motorcycleYear}
                      onChange={(e) => setFormData({...formData, motorcycleYear: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Placa
                    </label>
                    <input
                      type="text"
                      value={formData.motorcyclePlate}
                      onChange={(e) => setFormData({...formData, motorcyclePlate: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="ABC-123"
                    />
                  </div>
                </div>
              </div>

              {/* Detalles del servicio */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-red-600 pb-2">
                  🔧 Detalles del Servicio
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Mecánico Asignado
                    </label>
                    <input
                      type="text"
                      value={formData.mechanicId}
                      onChange={(e) => setFormData({...formData, mechanicId: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Nombre del mecánico"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Prioridad
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="LOW">🟢 Baja</option>
                      <option value="MEDIUM"> Media</option>
                      <option value="HIGH">🟠 Alta</option>
                      <option value="URGENT">🔴 Urgente</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Descripción del Problema *
                  </label>
                  <textarea
                    required
                    value={formData.problemDescription}
                    onChange={(e) => setFormData({...formData, problemDescription: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    rows="3"
                    placeholder="Describe el problema reportado por el cliente..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-800 text-white py-3 rounded-lg font-bold hover:from-red-700 hover:to-red-900 transition shadow-lg"
                >
                  💾 Crear Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle de Orden */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-gray-900 to-red-900 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-black text-white uppercase">
                📋 Detalle de Orden #{selectedOrder.id.substring(0, 8)}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:text-red-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">👤 Cliente</h3>
                  <p className="text-lg font-semibold">{selectedOrder.customer?.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer?.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">️ Motocicleta</h3>
                  <p className="text-lg font-semibold">
                    {selectedOrder.motorcycle?.brand} {selectedOrder.motorcycle?.model}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.motorcycle?.year} - {selectedOrder.motorcycle?.plate || 'Sin placa'}
                  </p>
                </div>
              </div>

              {/* Problema */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-2">🔍 Problema Reportado</h3>
                <p className="text-gray-700">{selectedOrder.problemDescription}</p>
              </div>

              {/* Diagnóstico */}
              {selectedOrder.diagnosis && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <h3 className="font-bold text-gray-800 mb-2"> Diagnóstico</h3>
                  <p className="text-gray-700">{selectedOrder.diagnosis}</p>
                </div>
              )}

              {/* Refacciones utilizadas */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 border-b-2 border-red-600 pb-2">
                    📦 Refacciones Utilizadas
                  </h3>
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Producto</th>
                        <th className="px-3 py-2 text-center">Cantidad</th>
                        <th className="px-3 py-2 text-right">Precio Unit.</th>
                        <th className="px-3 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">{item.product?.name}</td>
                          <td className="px-3 py-2 text-center">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">${parseFloat(item.unitPrice).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-bold">${parseFloat(item.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Servicios de mano de obra */}
              {selectedOrder.laborServices && selectedOrder.laborServices.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 border-b-2 border-red-600 pb-2">
                    🔧 Mano de Obra
                  </h3>
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Descripción</th>
                        <th className="px-3 py-2 text-center">Horas</th>
                        <th className="px-3 py-2 text-right">Tarifa/Hora</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.laborServices.map((labor, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">{labor.description}</td>
                          <td className="px-3 py-2 text-center">{labor.hours}</td>
                          <td className="px-3 py-2 text-right">${parseFloat(labor.ratePerHour).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-bold">${parseFloat(labor.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totales */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">💰 Resumen de Costos</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Refacciones:</span>
                      <span className="font-bold">
                        ${selectedOrder.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2)}
                      </span>
                    </div>
                    {selectedOrder.laborServices && selectedOrder.laborServices.length > 0 && (
                      <div className="flex justify-between">
                        <span>Mano de Obra:</span>
                        <span className="font-bold">
                          ${selectedOrder.laborServices.reduce((sum, labor) => sum + parseFloat(labor.total), 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-black text-red-600 pt-2 border-t-2 border-red-600">
                      <span>TOTAL:</span>
                      <span>
                        ${(
                          selectedOrder.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0) +
                          (selectedOrder.laborServices?.reduce((sum, labor) => sum + parseFloat(labor.total), 0) || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cambiar estado */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3"> Cambiar Estado</h3>
                <div className="flex flex-wrap gap-2">
                  {['RECEIVED', 'DIAGNOSING', 'REPAIRING', 'READY', 'DELIVERED'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedOrder.id, status)}
                      disabled={selectedOrder.status === status}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                        selectedOrder.status === status
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full bg-gray-300 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-400 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrders;
