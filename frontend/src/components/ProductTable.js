import React, { useState } from 'react';
import { productAPI } from '../services/api';
import { toast } from 'react-toastify';
import './ProductTable.css';

const ProductRow = ({ product, onUpdate, onDelete, onRowClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(product);
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(product);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(product);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await productAPI.update(product.id, editData);
      onUpdate(response.data.product);
      setIsEditing(false);
      toast.success('Product updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    try {
      await productAPI.delete(product.id);
      onDelete(product.id);
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed');
    }
  };

  const getStatusClass = (stock) => {
    return stock > 0 ? 'status-in-stock' : 'status-out-stock';
  };

  const getStatusText = (stock) => {
    return stock > 0 ? 'In Stock' : 'Out of Stock';
  };

  if (isEditing) {
    return (
      <tr className="editing-row">
        <td>
          {product.image ? (
            <img src={product.image} alt={product.name} className="product-image" />
          ) : (
            <div className="product-image-placeholder">📦</div>
          )}
        </td>
        <td>
          <input
            type="text"
            name="name"
            value={editData.name}
            onChange={handleChange}
            className="edit-input"
          />
        </td>
        <td>
          <input
            type="text"
            name="unit"
            value={editData.unit}
            onChange={handleChange}
            className="edit-input"
          />
        </td>
        <td>
          <input
            type="text"
            name="category"
            value={editData.category}
            onChange={handleChange}
            className="edit-input"
          />
        </td>
        <td>
          <input
            type="text"
            name="brand"
            value={editData.brand}
            onChange={handleChange}
            className="edit-input"
          />
        </td>
        <td>
          <input
            type="number"
            name="stock"
            value={editData.stock}
            onChange={handleChange}
            className="edit-input"
            min="0"
          />
        </td>
        <td>
          <span className={getStatusClass(editData.stock)}>
            {getStatusText(editData.stock)}
          </span>
        </td>
        <td>
          <div className="action-buttons">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-sm btn-success"
            >
              {saving ? '⏳' : '✓ Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="btn btn-sm btn-secondary"
            >
              ✗ Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr onClick={() => onRowClick(product)} className="product-row">
      <td>
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-image" />
        ) : (
          <div className="product-image-placeholder">📦</div>
        )}
      </td>
      <td><strong>{product.name}</strong></td>
      <td>{product.unit}</td>
      <td>{product.category}</td>
      <td>{product.brand}</td>
      <td>{product.stock}</td>
      <td>
        <span className={getStatusClass(product.stock)}>
          {getStatusText(product.stock)}
        </span>
      </td>
      <td>
        <div className="action-buttons">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="btn btn-sm btn-primary"
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="btn btn-sm btn-danger"
          >
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

const ProductTable = ({ products, onUpdate, onDelete, onRowClick }) => {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>📦 No products found</p>
        <p className="empty-subtitle">Add products or import from CSV to get started</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onRowClick={onRowClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;