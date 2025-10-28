import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { performanceService } from '../../services/performanceService';
import { authService } from '../../services/authService';

interface KpiRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKpiRecorded: () => void;
  userId: number;
}

interface KpiRow {
  id: string;
  kpiName: string;
  value: string;
  unit: string;
  notes: string;
  snapshotDate: string;
  period: string;
  visibility: string;
  isLocked: boolean;
  isValid: boolean;
  validationError: string;
}

// KPI Templates with locked fields
const KPI_TEMPLATES = [
  { name: 'Task Completion Rate', unit: '%', category: 'Productivity' },
  { name: 'Customer Satisfaction', unit: '%', category: 'Quality' },
  { name: 'Sales Target Achievement', unit: '%', category: 'Sales' },
  { name: 'Project Delivery Rate', unit: '%', category: 'Delivery' },
  { name: 'Code Quality Score', unit: '/10', category: 'Quality' },
  { name: 'Response Time', unit: 'hours', category: 'Service' },
  { name: 'Team Collaboration Score', unit: '/10', category: 'Teamwork' },
  { name: 'Learning & Development Hours', unit: 'hours', category: 'Growth' },
  { name: 'Innovation Projects', unit: 'count', category: 'Innovation' },
  { name: 'Revenue Generated', unit: '$', category: 'Sales' },
];

const ALLOWED_UNITS = ['%', 'hours', 'count', '/10', '€', '$'];

const KpiRecordModalEnhanced: React.FC<KpiRecordModalProps> = ({
  isOpen,
  onClose,
  onKpiRecorded,
  userId
}) => {
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [rows, setRows] = useState<KpiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (isOpen && rows.length === 0) {
      addNewRow();
    }
  }, [isOpen]);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUserName(user.full_name);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const addNewRow = () => {
    const newRow: KpiRow = {
      id: Date.now().toString(),
      kpiName: '',
      value: '',
      unit: '%',
      notes: '',
      snapshotDate: new Date().toISOString().split('T')[0],
      period: 'monthly',
      visibility: 'manager',
      isLocked: false,
      isValid: false,
      validationError: ''
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) return; // Keep at least one row
    setRows(rows.filter(row => row.id !== id));
  };

  const handleTemplateSelect = (template: typeof KPI_TEMPLATES[0]) => {
    if (rows.length > 0) {
      const updatedRows = [...rows];
      updatedRows[0] = {
        ...updatedRows[0],
        kpiName: template.name,
        unit: template.unit,
        isLocked: true
      };
      setRows(updatedRows);
      setSelectedTemplate(template.name);
      validateRow(updatedRows[0]);
    }
  };

  const handleModeChange = (template: boolean) => {
    setUseTemplate(template);
    if (!template && rows.length > 0) {
      // Unlock fields when switching to custom
      const updatedRows = [...rows];
      updatedRows[0] = { ...updatedRows[0], isLocked: false };
      setRows(updatedRows);
      setSelectedTemplate('');
    }
  };

  const validateValue = (value: string, unit: string): { isValid: boolean; error: string } => {
    if (!value || value.trim() === '') {
      return { isValid: false, error: 'Value is required' };
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { isValid: false, error: 'Must be a valid number' };
    }

    switch (unit) {
      case '%':
        if (numValue < 0 || numValue > 100) {
          return { isValid: false, error: 'Must be between 0-100' };
        }
        if (!/^\d+(\.\d{0,1})?$/.test(value)) {
          return { isValid: false, error: 'Max 1 decimal place' };
        }
        break;
      case '/10':
        if (numValue < 0 || numValue > 10) {
          return { isValid: false, error: 'Must be between 0-10' };
        }
        if (!/^\d+(\.\d{0,1})?$/.test(value)) {
          return { isValid: false, error: 'Max 1 decimal place' };
        }
        break;
      case 'hours':
      case 'count':
        if (numValue < 0) {
          return { isValid: false, error: 'Must be ≥ 0' };
        }
        break;
      case '€':
      case '$':
        if (numValue < 0) {
          return { isValid: false, error: 'Must be ≥ 0' };
        }
        if (!/^\d+(\.\d{0,2})?$/.test(value)) {
          return { isValid: false, error: 'Max 2 decimal places' };
        }
        break;
    }

    return { isValid: true, error: '' };
  };

  const validateRow = (row: KpiRow): KpiRow => {
    let isValid = true;
    let validationError = '';

    if (!row.kpiName.trim()) {
      isValid = false;
      validationError = 'KPI name is required';
    } else if (!row.value.trim()) {
      isValid = false;
      validationError = 'Value is required';
    } else {
      const valueValidation = validateValue(row.value, row.unit);
      isValid = valueValidation.isValid;
      validationError = valueValidation.error;
    }

    return { ...row, isValid, validationError };
  };

  const updateRow = (id: string, field: keyof KpiRow, value: any) => {
    const updatedRows = rows.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value };
        return validateRow(updated);
      }
      return row;
    });
    setRows(updatedRows);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const validRows = rows.filter(row => row.isValid);
      
      if (validRows.length === 0) {
        setError('Please fix validation errors before submitting');
        setLoading(false);
        return;
      }

      const results: string[] = [];
      const errors: Array<{ row: string; error: string }> = [];

      // Submit each valid row
      for (const row of validRows) {
        try {
          await performanceService.createKpiSnapshot({
            user_id: userId,
            kpi_name: row.kpiName.trim(),
            value: parseFloat(row.value),
            unit: row.unit.trim() || undefined,
            notes: row.notes.trim() || undefined,
            snapshot_date: row.snapshotDate ? new Date(row.snapshotDate).toISOString() : undefined,
            period: row.period,
            visibility: row.visibility,
            measured_by_id: userId
          });
          results.push(row.id);
        } catch (err: any) {
          errors.push({ row: row.id, error: err.response?.data?.detail || 'Failed to record' });
        }
      }

      if (errors.length === 0) {
        // All successful
        onKpiRecorded();
        resetForm();
        onClose();
      } else if (results.length > 0) {
        // Partial success
        setError(`${results.length} KPIs recorded, but ${errors.length} failed`);
        // Remove successful rows
        setRows(rows.filter(row => !results.includes(row.id)));
      } else {
        // All failed
        setError('Failed to record KPIs. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to record KPIs');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRows([]);
    setUseTemplate(true);
    setSelectedTemplate('');
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      // Ctrl+Enter to submit
      handleSubmit(e as any);
    }
  };

  if (!isOpen) return null;

  const allValid = rows.length > 0 && rows.every(row => row.isValid);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onKeyDown={handleKeyDown}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Record KPI Snapshot
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track performance metrics over time
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Template Toggle */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => handleModeChange(true)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                useTemplate
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Use Template
            </button>
            <button
              type="button"
              onClick={() => handleModeChange(false)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                !useTemplate
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Custom KPI
            </button>
          </div>

          {/* Template Selection */}
          {useTemplate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select KPI Template
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                {KPI_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className={`text-left px-3 py-2 rounded-md border-2 transition-colors ${
                      selectedTemplate === template.name
                        ? 'border-primary bg-primary-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{template.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {template.category} • Unit: {template.unit}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* KPI Rows */}
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className={`border-2 rounded-lg p-4 ${
                  row.validationError ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
              >
                {/* Row Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    KPI Entry {rows.length > 1 ? `#${index + 1}` : ''}
                  </span>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Remove this entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* KPI Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      KPI Name <span className="text-red-500">*</span>
                      {row.isLocked && (
                        <span className="ml-2 text-xs text-primary bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                          🔒 Locked
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={row.kpiName}
                      onChange={(e) => updateRow(row.id, 'kpiName', e.target.value)}
                      required
                      disabled={row.isLocked}
                      maxLength={255}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-700 dark:disabled:text-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Task Completion Rate"
                    />
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={row.value}
                      onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="85.5"
                    />
                    {row.validationError && row.value && (
                      <p className="text-xs text-red-600 mt-1">{row.validationError}</p>
                    )}
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit
                      {row.isLocked && (
                        <span className="ml-2 text-xs text-primary bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                          🔒 Locked
                        </span>
                      )}
                    </label>
                    <select
                      value={row.unit}
                      onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                      disabled={row.isLocked}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-700 dark:disabled:text-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {ALLOWED_UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  {/* Snapshot Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Snapshot Date
                    </label>
                    <input
                      type="date"
                      value={row.snapshotDate}
                      onChange={(e) => updateRow(row.id, 'snapshotDate', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Period */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Period
                    </label>
                    <select
                      value={row.period}
                      onChange={(e) => updateRow(row.id, 'period', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>

                  {/* Visibility */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Visibility
                    </label>
                    <div className="flex gap-2">
                      {['me', 'manager', 'admin'].map(vis => (
                        <button
                          key={vis}
                          type="button"
                          onClick={() => updateRow(row.id, 'visibility', vis)}
                          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                            row.visibility === vis
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                          }`}
                        >
                          {vis.charAt(0).toUpperCase() + vis.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={row.notes}
                      onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Add context about this measurement..."
                    />
                  </div>
                </div>

                {/* Preview */}
                {row.isValid && row.value && row.kpiName && (
                  <div className="mt-4 bg-primary-50 dark:bg-blue-900/20 border border-primary-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Preview:</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-medium text-primary dark:text-blue-400">
                        {parseFloat(row.value).toFixed(row.unit === '$' || row.unit === '€' ? 2 : 1)}
                      </span>
                      <span className="text-lg text-primary dark:text-blue-400">{row.unit}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">— {row.kpiName}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {row.period.charAt(0).toUpperCase() + row.period.slice(1)} • 
                      Visible to: {row.visibility} • 
                      Date: {new Date(row.snapshotDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Another Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={addNewRow}
              className="text-sm text-primary hover:text-blue-700 font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add another snapshot
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs">Esc</kbd> to close, 
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs ml-1">Ctrl+Enter</kbd> to submit
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !allValid}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                title={!allValid ? 'Fix validation errors to enable' : ''}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Record {rows.length > 1 ? `${rows.length} KPIs` : 'KPI'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KpiRecordModalEnhanced;
