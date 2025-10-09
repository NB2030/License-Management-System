import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { DollarSign, Plus, Trash2, Edit2, Save, X, Package, Heart } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface PricingTier {
  id: string;
  amount: number;
  duration_days: number;
  name: string;
  is_active: boolean | null;
  tier_type: 'product' | 'donation';
  product_identifier: string | null;
  created_at: string | null;
}

export default function PricingTiers() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    duration_days: 30,
    name: '',
    tier_type: 'donation' as 'product' | 'donation',
    product_identifier: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load from cache first
    const cachedTiers = sessionStorage.getItem('pricing_tiers_cache');
    if (cachedTiers) {
      try {
        setTiers(JSON.parse(cachedTiers));
        setLoading(false);
      } catch (e) {
        console.error('Error parsing cached tiers', e);
      }
    }
    
    loadTiers();
  }, []);

  const loadTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .order('tier_type', { ascending: true })
        .order('amount', { ascending: true });

      if (error) throw error;
      if (data) {
        setTiers(data);
        // Cache tiers
        sessionStorage.setItem('pricing_tiers_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error loading pricing tiers:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تحميل فئات التسعير"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTier = async () => {
    try {
      // Validation
      if (formData.tier_type === 'product' && !formData.product_identifier.trim()) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "يجب إدخال معرّف المنتج لفئات المنتجات"
        });
        return;
      }

      const { error } = await supabase.from('pricing_tiers').insert({
        amount: formData.amount,
        duration_days: formData.duration_days,
        name: formData.name,
        tier_type: formData.tier_type,
        product_identifier: formData.tier_type === 'product' ? formData.product_identifier : null,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "نجح",
        description: "تم إنشاء الفئة بنجاح"
      });
      
      setShowCreateModal(false);
      setFormData({ amount: 0, duration_days: 30, name: '', tier_type: 'donation', product_identifier: '' });
      loadTiers();
    } catch (error) {
      console.error('Error creating tier:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل إنشاء الفئة"
      });
    }
  };

  const updateTier = async (id: string) => {
    try {
      // Validation
      if (formData.tier_type === 'product' && !formData.product_identifier.trim()) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "يجب إدخال معرّف المنتج لفئات المنتجات"
        });
        return;
      }

      const { error } = await supabase
        .from('pricing_tiers')
        .update({
          amount: formData.amount,
          duration_days: formData.duration_days,
          name: formData.name,
          tier_type: formData.tier_type,
          product_identifier: formData.tier_type === 'product' ? formData.product_identifier : null,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "نجح",
        description: "تم تحديث الفئة بنجاح"
      });
      
      setEditingId(null);
      loadTiers();
    } catch (error) {
      console.error('Error updating tier:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تحديث الفئة"
      });
    }
  };

  const deleteTier = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      const { error } = await supabase.from('pricing_tiers').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: "نجح",
        description: "تم حذف الفئة بنجاح"
      });
      
      loadTiers();
    } catch (error) {
      console.error('Error deleting tier:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حذف الفئة"
      });
    }
  };

  const startEdit = (tier: PricingTier) => {
    setEditingId(tier.id);
    setFormData({
      amount: tier.amount,
      duration_days: tier.duration_days,
      name: tier.name,
      tier_type: tier.tier_type,
      product_identifier: tier.product_identifier || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ amount: 0, duration_days: 30, name: '', tier_type: 'donation', product_identifier: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const productTiers = tiers.filter(t => t.tier_type === 'product');
  const donationTiers = tiers.filter(t => t.tier_type === 'donation');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">فئات التسعير</h2>
          <p className="text-sm text-gray-600 mt-1">إدارة المبالغ ومدة التراخيص لطلبات Ko-fi</p>
        </div>
        <button
          onClick={() => {
            setFormData({ amount: 0, duration_days: 30, name: '', tier_type: 'donation', product_identifier: '' });
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة فئة
        </button>
      </div>

      {/* Product Tiers Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-800">فئات المنتجات</h3>
          <span className="text-sm text-gray-500">({productTiers.length})</span>
        </div>
        <div className="grid gap-4">
          {productTiers.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
              لا توجد فئات منتجات بعد
            </div>
          ) : (
            productTiers.map((tier) => (
              <div key={tier.id} className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-purple-500">
                {editingId === tier.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          نوع الفئة
                        </label>
                        <select
                          value={formData.tier_type}
                          onChange={(e) => setFormData({ ...formData, tier_type: e.target.value as 'product' | 'donation' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="product">منتج</option>
                          <option value="donation">تبرع</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          كود المنتج (Direct Link Code) *
                        </label>
                        <input
                          type="text"
                          value={formData.product_identifier}
                          onChange={(e) => setFormData({ ...formData, product_identifier: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="مثل: abc123def"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          من رابط المنتج: ko-fi.com/s/[الكود]
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          عدد الأيام
                        </label>
                        <input
                          type="number"
                          value={formData.duration_days}
                          onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          اسم الفئة
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTier(tier.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                        حفظ
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        <X className="w-4 h-4" />
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{tier.name}</h3>
                        <div className="flex gap-4 mt-1 text-sm text-gray-600">
                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">معرّف: {tier.product_identifier}</span>
                          <span>المدة: {tier.duration_days} يوم ({Math.round(tier.duration_days / 30)} شهر)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(tier)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteTier(tier.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Donation Tiers Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-pink-600" />
          <h3 className="text-xl font-semibold text-gray-800">فئات التبرعات</h3>
          <span className="text-sm text-gray-500">({donationTiers.length})</span>
        </div>
        <div className="grid gap-4">
          {donationTiers.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
              لا توجد فئات تبرعات بعد
            </div>
          ) : (
            donationTiers.map((tier) => (
              <div key={tier.id} className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-pink-500">
                {editingId === tier.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          نوع الفئة
                        </label>
                        <select
                          value={formData.tier_type}
                          onChange={(e) => setFormData({ ...formData, tier_type: e.target.value as 'product' | 'donation' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="product">منتج</option>
                          <option value="donation">تبرع</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          المبلغ ($)
                        </label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          عدد الأيام
                        </label>
                        <input
                          type="number"
                          value={formData.duration_days}
                          onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          اسم الفئة
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTier(tier.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                        حفظ
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        <X className="w-4 h-4" />
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-pink-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{tier.name}</h3>
                        <div className="flex gap-4 mt-1 text-sm text-gray-600">
                          <span>المبلغ: ${tier.amount}</span>
                          <span>المدة: {tier.duration_days} يوم ({Math.round(tier.duration_days / 30)} شهر)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(tier)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteTier(tier.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">كيفية استخدام فئات التسعير:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>فئات المنتجات:</strong> استخدم معرّف المنتج (Variation Name أو Direct Link Code) من Ko-fi لتفعيل الترخيص تلقائياً</li>
          <li><strong>فئات التبرعات:</strong> يتم مطابقة المبلغ تلقائياً - النظام يختار أعلى فئة لا تتجاوز مبلغ التبرع</li>
        </ul>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">إضافة فئة جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع الفئة
                </label>
                <select
                  value={formData.tier_type}
                  onChange={(e) => setFormData({ ...formData, tier_type: e.target.value as 'product' | 'donation' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="donation">تبرع</option>
                  <option value="product">منتج</option>
                </select>
              </div>

              {formData.tier_type === 'product' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      معرّف المنتج من Ko-fi *
                    </label>
                    <input
                      type="text"
                      value={formData.product_identifier}
                      onChange={(e) => setFormData({ ...formData, product_identifier: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="مثال: Blue, Large, Premium"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      أدخل Variation Name أو Direct Link Code من Ko-fi بالضبط
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عدد الأيام
                    </label>
                    <input
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المبلغ ($)
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="10.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      سيتم تفعيل هذه الفئة للتبرعات بهذا المبلغ أو أكثر
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عدد الأيام
                    </label>
                    <input
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الفئة
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="دعم متوسط - شهر واحد"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={createTier}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  إنشاء
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}