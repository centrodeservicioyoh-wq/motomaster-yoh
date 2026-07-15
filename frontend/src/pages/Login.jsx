import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('¡Bienvenido a MOTOMASTER YOH!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          {/* Logo del negocio */}
          <div className="flex justify-center mb-6">
            <img 
              src="/assets/logo.png" 
              alt="MOTOMASTER YOH" 
              className="h-32 w-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%23333" width="120" height="120"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="16" font-weight="bold" dominant-baseline="middle">LOGO</text></svg>';
              }}
            />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-wider">
            MOTOMASTER YOH
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            <p className="text-red-600 font-semibold uppercase text-sm tracking-wider">
              Refaccionaria y Taller
            </p>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
          </div>
          
          <p className="text-gray-500 text-sm">
            Sistema de Gestión Integral
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:from-red-700 hover:to-red-900 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : '🔑 Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 text-center border-t pt-4">
          <p className="text-xs text-gray-500">
            © 2026 MOTOMASTER YOH
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
