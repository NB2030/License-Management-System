import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AdminLoginForm from './components/AdminLoginForm';
import AdminDashboard from './components/AdminDashboard';
import AdminProfile from './components/AdminProfile';
import Documentation from './components/Documentation';
import KofiOrders from './components/KofiOrders';
import PricingTiers from './components/PricingTiers';
import { BookOpen, LayoutDashboard, LogOut, Shield, UserCircle, ShoppingCart, DollarSign } from 'lucide-react';

type View = 'dashboard' | 'docs' | 'profile' | 'kofi' | 'pricing';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (_event === 'SIGNED_IN' && session) {
        // Only check admin status if not already authenticated
        // This prevents unnecessary calls on every auth state change
        if (!isAuthenticated) {
          checkAdminStatus();
        }
      } else if (_event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await checkAdminStatus();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      // Use server-side admin verification via Edge Function
      const { data, error } = await supabase.functions.invoke('check-admin');

      if (error || !data?.isAdmin) {
        console.error('Admin verification failed:', error);
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setAdminEmail(user.email);
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Admin check error:', error);
      setIsAuthenticated(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setAdminEmail('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">نظام إدارة التراخيص</h1>
                <p className="text-xs text-gray-500">{adminEmail}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                لوحة الإدارة
              </button>

              <button
                onClick={() => setCurrentView('kofi')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'kofi'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                طلبات Ko-fi
              </button>

              <button
                onClick={() => setCurrentView('pricing')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'pricing'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                فئات التسعير
              </button>

              <button
                onClick={() => setCurrentView('docs')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'docs'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                التوثيق
              </button>

              <button
                onClick={() => setCurrentView('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCircle className="w-4 h-4" />
                الملف الشخصي
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      {currentView === 'dashboard' && <AdminDashboard />}
      {currentView === 'kofi' && <KofiOrders />}
      {currentView === 'pricing' && <PricingTiers />}
      {currentView === 'docs' && <Documentation />}
      {currentView === 'profile' && <AdminProfile />}
    </div>
  );
}

export default App;
