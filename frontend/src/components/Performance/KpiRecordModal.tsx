import React, { useState } from 'react';
import { X, TrendingUp, Plus } from 'lucide-react';
import { performanceService } from '../../services/performanceService';

interface KpiRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKpiRecorded: () => void;
  userId: number;
}

// Common KPI templates
const KPI_TEMPLATES = [
  { name: 'Task Completion Rate', unit: '%', category: 'Productivity' },
  { name: 'Customer Satisfaction', unit: '%', category: 'Quality' },
  { name: 'Sales Target Achievement', unit: '%', category: 'Sales' },
  { name: 'Project Delivery Rate', unit: '%', category: 'Delivery' },
  { name: 'Code Quality Score', unit: '/10', category: 'Quality' },
  { name: 'Response Time', unit: 'hours', category: 'Service' },
  { name: 'Team Collaboration Score', unit: '/5', category: 'Teamwork' },
  { name: 'Learning & Development Hours', unit: 'hours', category: 'Growth' },
  { name: 'Innovation Projects', unit: '#', category: 'Innovation' },
  { name: 'Revenue Generated', unit: '$', category: 'Sales' },
];

const KpiRecordModal: React.FC<KpiRecordModalProps> = ({
  isOpen,
  onClose,
  onKpiRecorded,
  userId
}) => {
  const [kpiName, setKpiName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('%');
  const [notes, setNotes] = useState('');
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTemplateSelect = (template: typeof KPI_TEMPLATES[0]) => {
    setKpiName(template.name);
    setUnit(template.unit);
    setSelectedTemplate(template.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setError('Please enter a valid number');
        return;
      }

      await performanceService.createKpiSnapshot({
        user_id: userId,
        kpi_name: kpiName.trim(),
        value: numValue,
        unit: unit.trim() || undefined,
        notes: notes.trim() || undefined
      });

      // Reset form
      setKpiName('');
      setValue('');
      setUnit('%');
      setNotes('');
      setUseTemplate(true);
      setSelectedTemplate('');
      onKpiRecorded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to record KPI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Record KPI Snapshot
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Template Toggle */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setUseTemplate(true)}
              className={`px-4 py-2 rounded-md font-medium ${
                useTemplate
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Use Template
            </button>
            <button
              type="button"
              onClick={() => setUseTemplate(false)}
              className={`px-4 py-2 rounded-md font-medium ${
                !useTemplate
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom KPI
            </button>
          </div>

          {/* Template Selection */}
          {useTemplate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select KPI Template
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {KPI_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className={`text-left px-3 py-2 rounded-md border-2 transition-colors ${
                      selectedTemplate === template.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {template.category} • Unit: {template.unit}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* KPI Name */}
          <div>
            <label htmlFor="kpi-name" className="block text-sm font-medium text-gray-700 mb-1">
              KPI Name <span className="text-red-500">*</span>
            </label>
            <input
              id="kpi-name"
              type="text"
              value={kpiName}
              onChange={(e) => setKpiName(e.target.value)}
              required
              maxLength={255}
              disabled={useTemplate && !kpiName}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="e.g., Task Completion Rate"
            />
          </div>

          {/* Value & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="kpi-value" className="block text-sm font-medium text-gray-700 mb-1">
                Value <span className="text-red-500">*</span>
              </label>
              <input
                id="kpi-value"
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="85.5"
              />
            </div>

            <div>
              <label htmlFor="kpi-unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                id="kpi-unit"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="%"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="kpi-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="kpi-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add context about this measurement..."
            />
          </div>

          {/* Preview */}
          {value && kpiName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Preview:</div>
              <div className="text-2xl font-bold text-blue-600">
                {parseFloat(value).toFixed(1)}
                {unit && <span className="text-lg ml-1">{unit}</span>}
              </div>
              <div className="text-sm text-gray-700 font-medium mt-1">{kpiName}</div>
              {notes && <div className="text-xs text-gray-600 mt-2">{notes}</div>}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !kpiName.trim() || !value}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recording...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Record KPI
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KpiRecordModal;

