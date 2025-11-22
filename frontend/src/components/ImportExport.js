import React, { useRef, useState } from 'react';
import { productAPI } from '../services/api';
import { toast } from 'react-toastify';
import './ImportExport.css';

const ImportExport = ({ onImportSuccess }) => {
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  const handleImport = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    setImporting(true);
    try {
      const response = await productAPI.import(formData);
      const { added, skipped, duplicates } = response.data;
      
      toast.success(`Import complete! Added: ${added}, Skipped: ${skipped}`);
      
      if (duplicates && duplicates.length > 0) {
        console.log('Duplicates found:', duplicates);
      }
      
      onImportSuccess();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExport = async () => {
    try {
      const response = await productAPI.export();
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Products exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  return (
    <div className="import-export">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <button 
        onClick={handleImport} 
        className="btn btn-secondary"
        disabled={importing}
      >
        {importing ? '⏳ Importing...' : '📥 Import CSV'}
      </button>
      
      <button 
        onClick={handleExport} 
        className="btn btn-secondary"
      >
        📤 Export CSV
      </button>
    </div>
  );
};

export default ImportExport;