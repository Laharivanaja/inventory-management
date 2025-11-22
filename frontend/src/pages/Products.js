import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ImportExport from '../components/ImportExport';
import ProductTable from '../components/ProductTable';
import HistorySidebar from '../components/HistorySidebar';
import AddProductModal from '../components/AddProductModal';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [pagination.page, selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        category: selectedCategory
      };
      
      const response = await productAPI.getAll(params);
      setProducts(response.data.products);
      setFilteredProducts(response.data.products);
      
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Load products error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(['all', ...response.data.categories]);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }

    try {
      const response = await productAPI.search(query);
      setFilteredProducts(response.data.products);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setPagination({ ...pagination, page: 1 });
  };

  const handleProductUpdate = (updatedProduct) => {
    setProducts(products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
    setFilteredProducts(filteredProducts.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
  };

  const handleProductDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
    setFilteredProducts(filteredProducts.filter(p => p.id !== id));
  };

  const handleProductAdded = () => {
    loadProducts();
    setShowAddModal(false);
  };

  const handleImportSuccess = () => {
    loadProducts();
    toast.success('Products imported successfully!');
  };

  const handleRowClick = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="products-page">
      <Navbar />
      
      <div className="products-container">
        <div className="products-header">
          <div className="header-left">
            <h1>Products Inventory</h1>
            <div className="filters">
              <SearchBar onSearch={handleSearch} />
              <CategoryFilter 
                categories={categories}
                selected={selectedCategory}
                onChange={handleCategoryFilter}
              />
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                + Add New Product
              </button>
            </div>
          </div>
          
          <div className="header-right">
            <ImportExport onImportSuccess={handleImportSuccess} />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <>
            <ProductTable 
              products={filteredProducts}
              onUpdate={handleProductUpdate}
              onDelete={handleProductDelete}
              onRowClick={handleRowClick}
            />
            
            {pagination.pages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span>Page {pagination.page} of {pagination.pages}</span>
                <button 
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedProduct && (
        <HistorySidebar 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleProductAdded}
        />
      )}
    </div>
  );
};

export default Products;