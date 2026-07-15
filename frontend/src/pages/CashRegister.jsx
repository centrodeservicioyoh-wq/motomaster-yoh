import { useState, useEffect } from 'react';
import { cashRegisterAPI } from '../services/cashRegister.service';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CashRegister = () => {
  const [loading, setLoading] = useState(true);
  const [currentCash, setCurrentCash] = useState(null);
  const [history, setHistory] = useState([]);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [currentData, historyData] = await Promise.all([
        cashRegisterAPI.getCurrent(),
        cashRegisterAPI.getHistory()
      ]);
      setCurrentCash(currentData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading cash register:', error);
      toast.error('Error al cargar la caja');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCash = async (e) => {
    e.preventDefault();
    try {
      await cashRegisterAPI.open(openingBalance);
      toast.success('Caja abierta exitosamente');
      setShowOpenModal(false);
      setOpeningBalance('');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al abrir la caja');
    }
  };

  const handleCloseCash = async (e) => {
    e.preventDefault();
    try {
      await cashRegisterAPI.close(closingBalance, notes);
      toast.success('Caja cerrada exitosamente');
      setShowCloseModal(false);
      setClosingBalance('');
      setNotes('');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cerrar la caja');
    }
  };

  const formatCurrency = (value) => `$${parseFloat(value || 0).toFixed(2)}`;

  const formatDate = (date) => new Date(date).toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-black via-gray-900 to-red-900 shadow-lg border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/assets/logo.png" alt="Logo" className="h-16 w-auto" onError={(e) => e.target.style.display='none'} />
            <div className="border-l-2 border-red-500 pl-4">
              <h1 className="text-2xl font-black text-white">MOTOMASTER YOH</h1>
              <p className="text-xs text-red-400">💰 Corte de Caja</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition">
            ← Volver
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl">Cargando...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-2xl border-t-4 border-red-600 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 to-red-900 px-6 py-4">
                <h2 className="text-xl font-black text-white uppercase">💵 Caja Actual</h2>
              </div>
              <div className="p-6">
                {currentCash?.isOpen ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-green-800 mb-1">✅ Caja Abierta</h3>
                          <p className="text-sm text-green-700">Apertura: {formatDate(currentCash.cashRegister.openingTime)}</p>
                        </div>
                        <div className="text-4xl">💵</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-600">Saldo Inicial</p>
                          <p className="text-xl font-black text-gray-800">{formatCurrency(currentCash.cashRegister.openingBalance)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-600">Ventas Efectivo</p>
                          <p className="text-xl font-black text-green-600">{formatCurrency(currentCash.currentSales?.cash || 0)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-600">Ventas Tarjeta</p>
                          <p className="text-xl font-black text-blue-600">{formatCurrency(currentCash.currentSales?.card || 0)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-600">Total Ventas</p>
                          <p className="text-xl font-black text-red-600">{formatCurrency(currentCash.currentSales?.total || 0)}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowCloseModal(true)} className="mt-6 w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 rounded-lg font-black uppercase hover:from-red-700 hover:to-red-900 transition shadow-lg">
                        🔒 Cerrar Caja
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🔒</div>
                    <p className="text-gray-600 mb-4">No hay caja abierta</p>
                    <button onClick={() => setShowOpenModal(true)} className="bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-4 rounded-lg font-black uppercase hover:from-green-700 hover:to-green-900 transition shadow-lg">
                      🔓 Abrir Caja
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl border-t-4 border-blue-600 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 to-blue-900 px-6 py-4">
                <h2 className="text-xl font-black text-white uppercase">📋 Historial de Cortes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Usuario</th>
                      <th className="px-4 py-3 text-left">Apertura</th>
                      <th className="px-4 py-3 text-left">Cierre</th>
                      <th className="px-4 py-3 text-right">Saldo Inicial</th>
                      <th className="px-4 py-3 text-right">Efectivo</th>
                      <th className="px-4 py-3 text-right">Tarjeta</th>
                      <th className="px-4 py-3 text-right">Crédito</th>
                      <th className="px-4 py-3 text-right">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">No hay registros de caja</td></tr>
                    ) : (
                      history.map((cash) => (
                        <tr key={cash.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold">{cash.user?.name}</td>
                          <td className="px-4 py-3 text-sm">{formatDate(cash.openingTime)}</td>
                          <td className="px-4 py-3 text-sm">{formatDate(cash.closingTime)}</td>
                          <td className="px-4 py-3 text-right font-bold">{formatCurrency(cash.openingBalance)}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-bold">{formatCurrency(cash.cashReceived)}</td>
                          <td className="px-4 py-3 text-right text-blue-600 font-bold">{formatCurrency(cash.cardReceived)}</td>
                          <td className="px-4 py-3 text-right text-orange-600 font-bold">{formatCurrency(cash.creditSales)}</td>
                          <td className="px-4 py-3 text-right text-red-600 font-black">{formatCurrency(cash.totalProfit)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {showOpenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-black text-white uppercase">🔓 Abrir Caja</h2>
              <button onClick={() => setShowOpenModal(false)} className="text-white hover:text-green-200 text-2xl">×</button>
            </div>
            <form onSubmit={handleOpenCash} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Saldo Inicial (efectivo en caja)</label>
                <input type="number" step="0.01" required value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg" placeholder="0.00" />
                <p className="text-xs text-gray-500 mt-2">Ingresa el amount de dinero en efectivo con el que inicias el turno</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowOpenModal(false)} className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-400 transition">Cancelar</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-green-800 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-900 transition shadow-lg">Abrir Caja</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-black text-white uppercase">🔒 Cerrar Caja</h2>
              <button onClick={() => setShowCloseModal(false)} className="text-white hover:text-red-200 text-2xl">×</button>
            </div>
            <form onSubmit={handleCloseCash} className="p-6">
              <div className="bg-yellow-50 border-2 border-yellow-600 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 font-bold mb-2">️ Información Importante</p>
                <p className="text-xs text-yellow-700">El sistema calculará automáticamente las ventas del turno. Ingresa el total de efectivo que hay en caja (incluyendo el saldo inicial).</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Efectivo en Caja (conteo final)</label>
                <input type="number" step="0.01" required value={closingBalance} onChange={(e) => setClosingBalance(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-lg" placeholder="0.00" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Observaciones</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" rows="3" placeholder="Notas adicionales sobre el corte..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCloseModal(false)} className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-400 transition">Cancelar</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-red-600 to-red-800 text-white py-3 rounded-lg font-bold hover:from-red-700 hover:to-red-900 transition shadow-lg">Cerrar Caja</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegister;
