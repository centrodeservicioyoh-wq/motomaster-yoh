import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-black via-gray-900 to-red-900 shadow-lg border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/assets/logo.png" alt="Logo" className="h-16 w-auto" onError={(e) => e.target.style.display='none'} />
            <div className="border-l-2 border-red-500 pl-4">
              <h1 className="text-2xl font-black text-white">MOTOMASTER YOH</h1>
              <p className="text-xs text-red-400">⚡ Refaccionaria y Taller</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right bg-black bg-opacity-40 px-4 py-2 rounded-lg">
              <p className="text-sm font-bold text-white">👤 {user?.name}</p>
              <p className="text-xs text-red-300">{user?.role === 'ADMIN' ? '👑 Administrador' : '👷 Vendedor'}</p>
            </div>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-black via-red-900 to-red-700 rounded-xl shadow-2xl p-8 mb-8 text-white border-l-8 border-red-500">
          <h2 className="text-3xl font-black mb-2 uppercase">🔧 Bienvenido al Sistema</h2>
          <p className="text-xl text-red-100 font-semibold">MOTOMASTER YOH - Gestión Profesional de Taller</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg border-t-4 border-red-600 p-6">
            <p className="text-sm font-semibold text-gray-600 uppercase">Ventas Hoy</p>
            <p className="text-3xl font-black text-red-600 mt-2">$0.00</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg border-t-4 border-orange-600 p-6">
            <p className="text-sm font-semibold text-gray-600 uppercase">Órdenes Activas</p>
            <p className="text-3xl font-black text-orange-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg border-t-4 border-yellow-600 p-6">
            <p className="text-sm font-semibold text-gray-600 uppercase">Productos</p>
            <p className="text-3xl font-black text-yellow-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg border-t-4 border-green-600 p-6">
            <p className="text-sm font-semibold text-gray-600 uppercase">Clientes</p>
            <p className="text-3xl font-black text-green-600 mt-2">0</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border-t-4 border-red-600 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-red-900 px-6 py-4">
            <h3 className="text-xl font-black text-white uppercase">🎛️ Panel de Operaciones</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => navigate('/inventory')} className="bg-gradient-to-br from-red-600 to-red-800 text-white py-5 px-6 rounded-xl font-black uppercase hover:from-red-700 hover:to-red-900 transition transform hover:scale-105 shadow-xl">
              <div className="text-3xl mb-2">📦</div>
              <div className="text-sm font-black">Inventario</div>
              <div className="text-xs mt-1 text-red-200">Refacciones</div>
            </button>
            <button onClick={() => navigate('/pos')} className="bg-gradient-to-br from-green-600 to-green-800 text-white py-5 px-6 rounded-xl font-black uppercase hover:from-green-700 hover:to-green-900 transition transform hover:scale-105 shadow-xl">
              <div className="text-3xl mb-2">🛒</div>
              <div className="text-sm font-black">Punto de Venta</div>
              <div className="text-xs mt-1 text-green-200">POS - Caja</div>
            </button>
            <button onClick={() => navigate('/work-orders')} className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-5 px-6 rounded-xl font-black uppercase hover:from-blue-700 hover:to-blue-900 transition transform hover:scale-105 shadow-xl">
              <div className="text-3xl mb-2">🔧</div>
              <div className="text-sm font-black">Órdenes Trabajo</div>
              <div className="text-xs mt-1 text-blue-200">Taller</div>
            </button>
            <button onClick={() => navigate('/reports')} className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-5 px-6 rounded-xl font-black uppercase hover:from-purple-700 hover:to-purple-900 transition transform hover:scale-105 shadow-xl">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm font-black">Reportes</div>
              <div className="text-xs mt-1 text-purple-200">Estadísticas</div>
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-xl border-t-4 border-yellow-600 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-yellow-900 px-6 py-4">
            <h3 className="text-xl font-black text-white uppercase">💰 Control Financiero</h3>
          </div>
          <div className="p-6">
            <button onClick={() => navigate('/cash-register')} className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 text-white py-5 px-6 rounded-xl font-black uppercase hover:from-yellow-700 hover:to-yellow-900 transition transform hover:scale-105 shadow-xl">
              <div className="text-3xl mb-2">💵</div>
              <div className="text-sm font-black">Corte de Caja</div>
              <div className="text-xs mt-1 text-yellow-200">Apertura, Cierre y Arqueos</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
