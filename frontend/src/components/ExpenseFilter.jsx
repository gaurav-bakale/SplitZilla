import React, { useState } from 'react';
import { Search, Filter, X, Download } from 'lucide-react';
import api from '../api/axios';

const ExpenseFilter = ({ groupId, onFilteredExpenses, members }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    memberId: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.memberId) params.append('memberId', filters.memberId);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
      if (filters.startDate) params.append('startDate', new Date(filters.startDate).toISOString());
      if (filters.endDate) params.append('endDate', new Date(filters.endDate).toISOString());

      const response = await api.get(`/api/expenses/group/${groupId}/filter?${params.toString()}`);
      onFilteredExpenses(response.data);
    } catch (error) {
      console.error('Error filtering expenses:', error);
      alert('Failed to filter expenses');
    }
  };

  const clearFilters = async () => {
    setFilters({
      search: '',
      memberId: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: ''
    });
    try {
      const response = await api.get(`/api/expenses/group/${groupId}`);
      onFilteredExpenses(response.data);
    } catch (error) {
      console.error('Error resetting expenses:', error);
    }
  };

  const EXPORT_EXTENSIONS = { csv: 'csv', json: 'json', markdown: 'md' };

  const exportExpenses = async (format) => {
    try {
      const response = await api.get(`/api/expenses/group/${groupId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses_${groupId}.${EXPORT_EXTENSIONS[format]}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting expenses:', error);
      alert('Failed to export expenses');
    }
  };

  const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            className={`${inputCls} py-2.5 pl-10 pr-4 placeholder:text-slate-400`}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-lg border border-slate-300 bg-white p-2.5 text-slate-600 shadow-card transition hover:bg-slate-50"
        >
          <Filter className="h-4 w-4" />
        </button>
        <div className="relative group">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white p-2.5 text-slate-600 shadow-card transition hover:bg-slate-50"
            title="Export expenses"
          >
            <Download className="h-4 w-4" />
          </button>
          <div className="invisible absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 opacity-0 shadow-card-md transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => exportExpenses('csv')}
              className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => exportExpenses('json')}
              className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => exportExpenses('markdown')}
              className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Markdown
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">Member</label>
              <select
                value={filters.memberId}
                onChange={(e) => handleFilterChange('memberId', e.target.value)}
                className={inputCls}
              >
                <option value="">All members</option>
                {members?.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">Min amount</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  className={`${inputCls} tabular-nums`}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">Max amount</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  className={`${inputCls} tabular-nums`}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">Start date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">End date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={applyFilters}
              className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-primary-700"
            >
              Apply filters
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-card transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseFilter;
