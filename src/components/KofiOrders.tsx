import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { AlertCircle, CheckCircle, Package, Trash2, Filter, ShoppingBag, DollarSign, RefreshCw } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface KofiOrder {
  id: string;
  message_id: string;
  timestamp: string;
  type: string;
  from_name: string | null;
  amount: string;
  email: string;
  currency: string | null;
  kofi_transaction_id: string | null;
  processed: boolean | null;
  user_id: string | null;
  license_id: string | null;
  created_at: string | null;
  shop_items?: any;
  licenses?: {
    license_key: string;
  } | null;
}

type FilterType = 'all' | 'Shop Order' | 'Donation';

export default function KofiOrders() {
  const [orders, setOrders] = useState<KofiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load from cache first
    const cachedOrders = sessionStorage.getItem('kofi_orders_cache');
    if (cachedOrders) {
      try {
        setOrders(JSON.parse(cachedOrders));
        setLoading(false);
      } catch (e) {
        console.error('Error parsing cached orders', e);
      }
    }
    
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('kofi_orders')
        .select('*, licenses(license_key)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) {
        setOrders(data);
        // Cache orders for faster loading
        sessionStorage.setItem('kofi_orders_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error loading Ko-fi orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    setRefreshing(true);
    try {
      // Get the most recent order timestamp
      const lastCreatedAt = orders.length > 0 ? orders[0].created_at : null;
      
      let query = supabase
        .from('kofi_orders')
        .select('*, licenses(license_key)')
        .order('created_at', { ascending: false });
      
      // Only fetch new orders if we have existing data
      if (lastCreatedAt) {
        query = query.gt('created_at', lastCreatedAt);
      }
      
      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Merge new orders with existing ones
        const updatedOrders = [...data, ...orders].slice(0, 50);
        setOrders(updatedOrders);
        
        // Update cache
        sessionStorage.setItem('kofi_orders_cache', JSON.stringify(updatedOrders));
        
        toast({
          title: "تم التحديث",
          description: `تم إضافة ${data.length} طلب جديد`
        });
      } else {
        toast({
          title: "لا يوجد جديد",
          description: "لا توجد طلبات جديدة"
        });
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تحديث الطلبات"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    try {
      const { error } = await supabase.from('kofi_orders').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: "نجح",
        description: "تم حذف الطلب بنجاح"
      });
      
      loadOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حذف الطلب"
      });
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filterType === 'all') return true;
    return order.type === filterType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">لا توجد طلبات Ko-fi بعد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">طلبات Ko-fi</h2>
          <button
            onClick={refreshOrders}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
          <Filter className="w-5 h-5 text-gray-500" />
          <button
            onClick={() => setFilterType('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" />
            الكل ({orders.length})
          </button>
          <button
            onClick={() => setFilterType('Shop Order')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              filterType === 'Shop Order'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            طلبات المتجر ({orders.filter(o => o.type === 'Shop Order').length})
          </button>
          <button
            onClick={() => setFilterType('Donation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              filterType === 'Donation'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            التبرعات ({orders.filter(o => o.type === 'Donation').length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المنتجات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مفتاح الترخيص
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {order.type === 'Shop Order' ? (
                        <>
                          <ShoppingBag className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">طلب متجر</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-600">تبرع</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.from_name || 'غير معروف'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${order.amount} {order.currency || 'USD'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.shop_items && Array.isArray(order.shop_items) && order.shop_items.length > 0 ? (
                      <div className="space-y-1">
                        {order.shop_items.map((item: any, idx: number) => (
                          <div key={idx} className="text-xs">
                            <span className="font-medium">{item.variation_name || item.direct_link_code}</span>
                            <span className="text-gray-500"> (x{item.quantity})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.licenses ? (
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {order.licenses.license_key}
                      </code>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(order.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.processed ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">تم التفعيل</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm text-yellow-600 font-medium">بانتظار الحساب</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف الطلب"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد طلبات من نوع "{filterType === 'Shop Order' ? 'طلبات المتجر' : filterType === 'Donation' ? 'التبرعات' : 'الكل'}"
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 كيفية ربط المنتجات بمدة الترخيص:</h3>
        <ol className="text-sm text-blue-800 space-y-1 mr-4">
          <li>1. انتقل إلى صفحة "فئات التسعير"</li>
          <li>2. أضف فئة جديدة واستخدم اسم المنتج في Ko-fi ضمن اسم الفئة</li>
          <li>3. مثال: إذا كان اسم المنتج "Premium License"، اجعل اسم الفئة "Premium License - سنة كاملة"</li>
          <li>4. عندما يشتري أحد هذا المنتج، سيتم تطبيق المدة المحددة في الفئة تلقائياً</li>
        </ol>
      </div>
    </div>
  );
}
