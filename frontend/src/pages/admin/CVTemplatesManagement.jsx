import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function CVTemplatesManagement() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateHtml: '',
    templateCss: '',
    category: '',
    isPremium: false,
    previewImageUrl: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminCVTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.updateCVTemplate(editingTemplate.id, formData);
        alert('Cập nhật template thành công!');
      } else {
        await api.createCVTemplate(formData);
        alert('Tạo template thành công!');
      }
      setShowForm(false);
      setEditingTemplate(null);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể lưu template'));
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name || '',
      description: template.description || '',
      templateHtml: template.templateHtml || '',
      templateCss: template.templateCss || '',
      category: template.category || '',
      isPremium: template.isPremium || false,
      previewImageUrl: template.previewImageUrl || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (templateId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa template này?')) return;
    
    try {
      await api.deleteCVTemplate(templateId);
      alert('Xóa template thành công!');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể xóa template'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      templateHtml: '',
      templateCss: '',
      category: '',
      isPremium: false,
      previewImageUrl: ''
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quản lý CV Templates</h1>
          <p className="text-lg text-gray-600">Quản lý các mẫu CV trong hệ thống</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingTemplate(null);
            resetForm();
          }}
          className="btn-primary"
        >
          <i className="fas fa-plus mr-2"></i>
          Tạo template mới
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {editingTemplate ? 'Chỉnh sửa template' : 'Tạo template mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên template *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  placeholder="IT, Design, Marketing..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HTML Template *</label>
              <textarea
                required
                value={formData.templateHtml}
                onChange={(e) => setFormData({ ...formData, templateHtml: e.target.value })}
                className="input-field font-mono text-sm"
                rows="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CSS</label>
              <textarea
                value={formData.templateCss}
                onChange={(e) => setFormData({ ...formData, templateCss: e.target.value })}
                className="input-field font-mono text-sm"
                rows="5"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview Image URL</label>
                <input
                  type="url"
                  value={formData.previewImageUrl}
                  onChange={(e) => setFormData({ ...formData, previewImageUrl: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Premium Template</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                {editingTemplate ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="btn-secondary"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-file-alt text-gray-400 text-6xl mb-4"></i>
          <p className="text-gray-600 text-lg">Không có template nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="card p-6">
              {template.previewImageUrl && (
                <img
                  src={template.previewImageUrl}
                  alt={template.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                {template.isPremium && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Premium
                  </span>
                )}
              </div>
              {template.category && (
                <p className="text-sm text-gray-500 mb-2">Danh mục: {template.category}</p>
              )}
              {template.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="flex-1 btn-secondary text-sm"
                >
                  <i className="fas fa-edit mr-2"></i>Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
