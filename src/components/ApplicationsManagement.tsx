import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { Plus, Copy, Eye, EyeOff, Trash2, Edit2 } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  description: string | null;
  app_key: string;
  app_secret: string;
  is_active: boolean | null;
  created_at: string | null;
  created_by: string | null;
  updated_at?: string | null;
}

export default function ApplicationsManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل التطبيقات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingApp) {
        const { error } = await supabase
          .from('applications')
          .update({
            name: formData.name,
            description: formData.description,
          })
          .eq('id', editingApp.id);

        if (error) throw error;

        toast({
          title: 'نجح',
          description: 'تم تحديث التطبيق بنجاح',
        });
      } else {
        const { data: appKeyData } = await supabase.rpc('generate_app_key');
        const { data: appSecretData } = await supabase.rpc('generate_app_secret');
        
        if (!appKeyData || !appSecretData) {
          throw new Error('فشل إنشاء مفاتيح التطبيق');
        }

        const { data: userData } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from('applications')
          .insert([{
            name: formData.name,
            description: formData.description,
            app_key: appKeyData,
            app_secret: appSecretData,
            created_by: userData.user?.id,
          }])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'نجح',
          description: 'تم إنشاء التطبيق بنجاح. احفظ بيانات الاعتماد في مكان آمن!',
        });

        if (data) {
          toast({
            title: 'بيانات الاعتماد',
            description: `App Key: ${data.app_key}`,
          });
        }
      }

      setFormData({ name: '', description: '' });
      setEditingApp(null);
      setIsDialogOpen(false);
      loadApplications();
    } catch (error) {
      console.error('Error saving application:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ التطبيق',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (app: Application) => {
    setEditingApp(app);
    setFormData({
      name: app.name,
      description: app.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التطبيق؟ سيتم حذف جميع التراخيص المرتبطة به.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم حذف التطبيق بنجاح',
      });

      loadApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حذف التطبيق',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: `تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} التطبيق بنجاح`,
      });

      loadApplications();
    } catch (error) {
      console.error('Error toggling application status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحديث حالة التطبيق',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'تم النسخ',
      description: `تم نسخ ${label} إلى الحافظة`,
    });
  };

  const toggleSecretVisibility = (appId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingApp(null);
    setFormData({ name: '', description: '' });
  };

  if (loading && applications.length === 0) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">إدارة التطبيقات</h2>
          <p className="text-gray-600 mt-2">
            قم بإنشاء وإدارة التطبيقات التي يمكنها استخدام نظام الترخيص
          </p>
        </div>
        <button
          onClick={() => {
            setEditingApp(null);
            setFormData({ name: '', description: '' });
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          تطبيق جديد
        </button>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingApp ? 'تعديل التطبيق' : 'إنشاء تطبيق جديد'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم التطبيق *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="مثال: تطبيق الويب الرئيسي"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="وصف اختياري للتطبيق"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'جاري الحفظ...' : editingApp ? 'تحديث' : 'إنشاء'}
                </button>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-xl font-bold">التطبيقات المسجلة</h3>
        </div>
        <div className="p-6">
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد تطبيقات مسجلة. قم بإنشاء تطبيق جديد للبدء.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">App Key</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">App Secret</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{app.name}</div>
                          {app.description && (
                            <div className="text-sm text-gray-500">{app.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {app.app_key.substring(0, 20)}...
                          </code>
                          <button
                            onClick={() => copyToClipboard(app.app_key, 'App Key')}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {showSecrets[app.id] ? app.app_secret : '••••••••••••••••'}
                          </code>
                          <button
                            onClick={() => toggleSecretVisibility(app.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {showSecrets[app.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(app.app_secret, 'App Secret')}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(app.id, app.is_active ?? false)}
                          className={`px-3 py-1 rounded-full text-xs ${
                            app.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {app.is_active ? 'نشط' : 'معطل'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(app)}
                            className="p-2 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
