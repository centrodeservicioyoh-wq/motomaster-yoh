import { useState, useEffect } from 'react';
import { reportAPI } from '../services/report.service';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [salesPeriod, setSalesPeriod] = useState('week');
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [inventoryData, setInventoryData] = useState(null);
  const [workOrderData, setWorkOrderData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [activeTab, salesPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const data = await reportAPI.getDashboard();
        setDashboardData(data);
      } else if (activeTab === 'sales') {
        const data = await reportAPI.getSalesByPeriod(salesPeriod);
        setSalesData(data);
      } else if (activeTab === 'products') {
        const data = await reportAPI.getTopProducts(10);
        setTopProducts(data);
      } else if (activeTab === 'mechanics') {
        const data = await reportAPI.getMechanicPerformance();
        setMechanics(data);
      } else if (activeTab === 'inventory') {
        const data = await reportAPI.getInventoryValue();
        setInventoryData(data);
      } else if (activeTab === 'workorders') {
        const data = await reportAPI.getWorkOrderSummary();
        setWorkOrderData(data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `$${parseFloat(value || 0).toFixed(2)}`;
  };

  const getStatusLabel = (status) => {
    const labels = {
      RECEIVED: 'Recibida',
      DIAGNOSING: 'Diagnóstico',
      REPAIRING: 'Reparación',
      READY: 'Lista',
      DELIVERED: 'Entregada'
    };
    return labels[status] || status;
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '' },
    { id: 'sales', label: '💰 Ventas', icon: '' },
    { id: 'products', label: '📦 Productos', icon: '📦' },
    { id: 'mechanics', label: '🔧 Mecánicos', icon: '🔧' },
    { id: 'inventory', label: '🏭 Inventario', icon: '🏭' },
    { id: 'workorders', label: ' Órdenes', icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-red-900 shadow-lg border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/assets/logo.png" alt="Logo" className="h-16 w-auto" onError={(e) => e.target.style.display='none'} />
            <div className="border-l-2 border-red-500 pl-4">
              <h1 className="text-2xl font-black text-white">MOTOMASTER YOH</h1>
              <p className="text-xs text-red-400"> Reportes y Estadísticas</p>
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

      {/* Tabs */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto space-x-2 py-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl">Cargando reportes...</p>
          </div>
        ) : (
          <>
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && dashboardData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-red-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Ventas Hoy</p>
                    <p className="text-2xl font-black text-red-600 mt-1">{formatCurrency(dashboardData.totalSalesToday)}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-green-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Ganancia Hoy</p>
                    <p className="text-2xl font-black text-green-600 mt-1">{formatCurrency(dashboardData.profitToday)}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-orange-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Órdenes Activas</p>
                    <p className="text-2xl font-black text-orange-600 mt-1">{dashboardData.activeOrders}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-yellow-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Productos</p>
                    <p className="text-2xl font-black text-yellow-600 mt-1">{dashboardData.totalProducts}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-blue-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Clientes</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">{dashboardData.totalCustomers}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-purple-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Stock Bajo</p>
                    <p className="text-2xl font-black text-purple-600 mt-1">{dashboardData.lowStockProducts}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-black via-red-900 to-red-700 rounded-xl shadow-2xl p-6 text-white">
                  <h2 className="text-2xl font-black mb-2"> Resumen del Negocio</h2>
                  <p className="text-red-100">MOTOMASTER YOH - Panel de Control Ejecutivo</p>
                </div>
              </div>
            )}

            {/* VENTAS */}
            {activeTab === 'sales' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                  <h2 className="text-xl font-black text-gray-800">💰 Ventas por Período</h2>
                  <div className="flex space-x-2">
                    {['day', 'week', 'month', 'year'].map(period => (
                      <button
                        key={period}
                        onClick={() => setSalesPeriod(period)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                          salesPeriod === period
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {period === 'day' ? 'Hoy' : period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
                      </button>
                    ))}
                  </div>
                </div>

                {salesData.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="text-6xl mb-4"></div>
                    <p className="text-gray-500">No hay datos de ventas para este período</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4">Gráfico de Ventas y Ganancias</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="ventas" stroke="#dc2626" strokeWidth={2} />
                        <Line type="monotone" dataKey="ganancias" stroke="#16a34a" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {salesData.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4">Resumen</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Ventas</p>
                        <p className="text-2xl font-black text-red-600">
                          {formatCurrency(salesData.reduce((sum, d) => sum + d.ventas, 0))}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Ganancias</p>
                        <p className="text-2xl font-black text-green-600">
                          {formatCurrency(salesData.reduce((sum, d) => sum + d.ganancias, 0))}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Transacciones</p>
                        <p className="text-2xl font-black text-blue-600">
                          {salesData.reduce((sum, d) => sum + d.transacciones, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCTOS */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-xl font-black text-gray-800">📦 Productos Más Vendidos</h2>
                </div>

                {topProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="text-6xl mb-4"></div>
                    <p className="text-gray-500">No hay productos vendidos aún</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold mb-4">Top 10 Productos</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={topProducts} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <Tooltip formatter={(value) => `${value} unidades`} />
                          <Bar dataKey="totalSold" fill="#dc2626" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-900 to-red-900 text-white">
                          <tr>
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">Producto</th>
                            <th className="px-4 py-3 text-left">Categoría</th>
                            <th className="px-4 py-3 text-left">Marca</th>
                            <th className="px-4 py-3 text-right">Vendidos</th>
                            <th className="px-4 py-3 text-right">Ingresos</th>
                            <th className="px-4 py-3 text-right">Ganancia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.map((product, index) => (
                            <tr key={product.id} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-3 font-bold text-red-600">{index + 1}</td>
                              <td className="px-4 py-3 font-semibold">{product.name}</td>
                              <td className="px-4 py-3">{product.category?.name || '-'}</td>
                              <td className="px-4 py-3">{product.brand?.name || '-'}</td>
                              <td className="px-4 py-3 text-right font-bold">{product.totalSold}</td>
                              <td className="px-4 py-3 text-right text-green-600 font-bold">{formatCurrency(product.totalRevenue)}</td>
                              <td className="px-4 py-3 text-right text-blue-600 font-bold">{formatCurrency(product.totalProfit)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* MECÁNICOS */}
            {activeTab === 'mechanics' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-xl font-black text-gray-800">🔧 Rendimiento de Mecánicos</h2>
                </div>

                {mechanics.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="text-6xl mb-4">🔧</div>
                    <p className="text-gray-500">No hay mecánicos registrados</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold mb-4">Horas Trabajadas por Mecánico</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={mechanics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="totalHours" fill="#2563eb" name="Horas" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-900 to-red-900 text-white">
                          <tr>
                            <th className="px-4 py-3 text-left">Mecánico</th>
                            <th className="px-4 py-3 text-center">Órdenes Completadas</th>
                            <th className="px-4 py-3 text-right">Horas Totales</th>
                            <th className="px-4 py-3 text-right">Total Cobrado</th>
                            <th className="px-4 py-3 text-right">Ganancia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mechanics.map((mechanic) => (
                            <tr key={mechanic.id} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-3 font-semibold">{mechanic.name}</td>
                              <td className="px-4 py-3 text-center">{mechanic.workOrdersCompleted}</td>
                              <td className="px-4 py-3 text-right">{mechanic.totalHours}h</td>
                              <td className="px-4 py-3 text-right text-green-600 font-bold">{formatCurrency(mechanic.totalEarned)}</td>
                              <td className="px-4 py-3 text-right text-blue-600 font-bold">{formatCurrency(mechanic.totalProfit)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* INVENTARIO */}
            {activeTab === 'inventory' && inventoryData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-blue-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Valor Costo</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">{formatCurrency(inventoryData.totalValue)}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-green-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Valor Venta</p>
                    <p className="text-2xl font-black text-green-600 mt-1">{formatCurrency(inventoryData.totalSaleValue)}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-red-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Ganancia Potencial</p>
                    <p className="text-2xl font-black text-red-600 mt-1">{formatCurrency(inventoryData.potentialProfit)}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-purple-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Total Productos</p>
                    <p className="text-2xl font-black text-purple-600 mt-1">{inventoryData.totalProducts}</p>
                  </div>
                </div>

                {inventoryData.byCategory.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4">Valor del Inventario por Categoría</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={inventoryData.byCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {inventoryData.byCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {inventoryData.lowStockProducts.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-red-600">
                    <div className="bg-red-600 text-white px-6 py-3">
                      <h3 className="text-lg font-black">⚠️ Alertas de Stock Bajo ({inventoryData.lowStockProducts.length})</h3>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left">Producto</th>
                          <th className="px-4 py-3 text-left">Código</th>
                          <th className="px-4 py-3 text-center">Stock Actual</th>
                          <th className="px-4 py-3 text-center">Stock Mínimo</th>
                          <th className="px-4 py-3 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryData.lowStockProducts.map(product => (
                          <tr key={product.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold">{product.name}</td>
                            <td className="px-4 py-3 font-mono text-sm">{product.code}</td>
                            <td className="px-4 py-3 text-center font-bold text-red-600">{product.stock}</td>
                            <td className="px-4 py-3 text-center">{product.minStock}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                {product.stock === 0 ? 'AGOTADO' : 'BAJO'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ÓRDENES DE TRABAJO */}
            {activeTab === 'workorders' && workOrderData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-blue-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Órdenes Completadas</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">{workOrderData.totalCompleted}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-green-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Ingresos Totales</p>
                    <p className="text-2xl font-black text-green-600 mt-1">{formatCurrency(workOrderData.totalRevenue)}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg border-t-4 border-red-600 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Órdenes Activas</p>
                    <p className="text-2xl font-black text-red-600 mt-1">
                      {workOrderData.byStatus.reduce((sum, s) => s.name !== 'DELIVERED' ? sum + s.value : sum, 0)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4">Órdenes por Estado</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={workOrderData.byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${getStatusLabel(name)}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {workOrderData.byStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4">Órdenes por Prioridad</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={workOrderData.byPriority}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#f59e0b" name="Cantidad" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;
