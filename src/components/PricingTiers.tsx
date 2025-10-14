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
  is_flexible_pricing: boolean | null;
  days_per_dollar: number | null;
  application_id: string | null;
}

interface Application {
  id: string;
  name: string;
}

export default function PricingTiers() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    duration_days: 30,
    name: '',
    tier_type: 'donation' as 'product' | 'donation',
    product_identifier: '',
    is_flexible_pricing: false,
    days_per_dollar: 30,
    application_id: null as string | null,
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
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) {
        setApplications(data);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

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
        is_flexible_pricing: formData.tier_type === 'product' ? formData.is_flexible_pricing : false,
        days_per_dollar: formData.tier_type === 'product' && formData.is_flexible_pricing ? formData.days_per_dollar : 0,
        application_id: formData.application_id,
      });

      if (error) throw error;

      toast({
        title: "نجح",
        description: "تم إنشاء الفئة بنجاح"
      });
      
      setShowCreateModal(false);
      setFormData({ amount: 0, duration_days: 30, name: '', tier_type: 'donation', product_identifier: '', is_flexible_pricing: false, days_per_dollar: 30, application_id: null });
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
          is_flexible_pricing: formData.tier_type === 'product' ? formData.is_flexible_pricing : false,
          days_per_dollar: formData.tier_type === 'product' && formData.is_flexible_pricing ? formData.days_per_dollar : 0,
          application_id: formData.application_id,
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
      is_flexible_pricing: tier.is_flexible_pricing || false,
      days_per_dollar: tier.days_per_dollar || 30,
      application_id: tier.application_id,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ amount: 0, duration_days: 30, name: '', tier_type: 'donation', product_identifier: '', is_flexible_pricing: false, days_per_dollar: 30, application_id: null });
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
            setFormData({ amount: 0, duration_days: 30, name: '', tier_type: 'donation', product_identifier: '', is_flexible_pricing: false, days_per_dollar: 30, application_id: null });
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
                        <div className="flex flex-col gap-1 mt-1 text-sm text-gray-600">
                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded inline-block w-fit">معرّف: {tier.product_identifier}</span>
                          {tier.is_flexible_pricing ? (
                            <span className="text-green-600 font-semibold">
                              💰 تسعير مرن: {tier.days_per_dollar} يوم لكل دولار
                            </span>
                          ) : (
                            <span>المدة: {tier.duration_days} يوم ({Math.round(tier.duration_days / 30)} شهر)</span>
                          )}
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
                        <p className="text-xs text-gray-500 mt-1">
                          الحد الأدنى للتبرع لتجديد الترخيص
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          عدد الأيام (التجديد)
                        </label>
                        <input
                          type="number"
                          value={formData.duration_days}
                          onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          يتم إضافتها للترخيص الحالي للمستخدم
                        </p>
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
                  
                  {/* Flexible Pricing Toggle */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="flexiblePricing"
                      checked={formData.is_flexible_pricing}
                      onChange={(e) => setFormData({ ...formData, is_flexible_pricing: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="flexiblePricing" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-green-900">تفعيل التسعير المرن (Pay What You Want)</div>
                      <div className="text-sm text-green-700">المدة تُحسب تلقائياً بناءً على المبلغ المدفوع</div>
                    </label>
                  </div>

                  {formData.is_flexible_pricing ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        عدد الأيام لكل دولار 💰
                      </label>
                      <input
                        type="number"
                        value={formData.days_per_dollar}
                        onChange={(e) => setFormData({ ...formData, days_per_dollar: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="30"
                        step="0.1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        مثال: 30 يوم لكل دولار = إذا دفع 5$ سيحصل على {Math.floor(5 * formData.days_per_dollar)} يوم ({Math.floor((5 * formData.days_per_dollar) / 30)} شهر)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        عدد الأيام (ثابت)
                      </label>
                      <input
                        type="number"
                        value={formData.duration_days}
                        onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="30"
                      />
                    </div>
                  )}
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

              {/* Hide application field for donations - they renew existing licenses regardless of app */}
              {formData.tier_type === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التطبيق المرتبط *
                  </label>
                  <select
                    value={formData.application_id || ''}
                    onChange={(e) => setFormData({ ...formData, application_id: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">بدون تطبيق محدد (ترخيص عام)</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    حدد التطبيق الذي سينشأ له الترخيص عند الشراء. إذا لم تحدد، سيكون الترخيص متاحاً لجميع التطبيقات.
                  </p>
                </div>
              )}

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