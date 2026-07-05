import { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Reports = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type, format) => {
    setIsExporting(true);
    try {
      const response = await api.get(`/reports/export/${format}?type=${type}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Completed Tasks Report</h2>
          <p className="text-gray-600 mb-4">Export all completed tasks with details</p>
          <div className="space-x-2">
            <button
              onClick={() => handleExport('completed', 'excel')}
              disabled={isExporting}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export Excel
            </button>
            <button
              onClick={() => handleExport('completed', 'csv')}
              disabled={isExporting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pending Tasks Report</h2>
          <p className="text-gray-600 mb-4">Export all pending and in-progress tasks</p>
          <div className="space-x-2">
            <button
              onClick={() => handleExport('pending', 'excel')}
              disabled={isExporting}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export Excel
            </button>
            <button
              onClick={() => handleExport('pending', 'csv')}
              disabled={isExporting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Employee-wise Report</h2>
          <p className="text-gray-600 mb-4">Export task statistics by employee</p>
          <div className="space-x-2">
            <button
              onClick={() => handleExport('employee', 'excel')}
              disabled={isExporting}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export Excel
            </button>
            <button
              onClick={() => handleExport('employee', 'csv')}
              disabled={isExporting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
