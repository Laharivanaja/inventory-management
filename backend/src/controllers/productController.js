// backend/src/controllers/productController.js
const { runQuery, getOne, getAll } = require('../../database');
const { importCSV, exportToCSV } = require('../utils/csvHandler');

// Get all products with optional filters, pagination, and sorting
const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      page = 1, 
      limit = 50, 
      sortBy = 'name', 
      order = 'ASC' 
    } = req.query;
    
    let query = 'SELECT * FROM products';
    const params = [];
    
    // Filter by category
    if (category && category !== 'all') {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    // Sorting
    const allowedSortFields = ['name', 'category', 'brand', 'stock', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const products = await getAll(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM products';
    if (category && category !== 'all') {
      countQuery += ' WHERE category = ?';
    }
    
    const { total } = await getOne(
      countQuery,
      category && category !== 'all' ? [category] : []
    );
    
    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Search products by name
const searchProducts = async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ message: 'Search query required' });
    }
    
    const products = await getAll(
      'SELECT * FROM products WHERE name LIKE ? ORDER BY name ASC',
      [`%${name}%`]
    );
    
    res.json({ products });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Failed to search products' });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await getOne('SELECT * FROM products WHERE id = ?', [id]);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { name, unit, category, brand, stock, image } = req.body;
    
    // Validation
    if (!name || !unit || !category || !brand) {
      return res.status(400).json({ 
        message: 'Name, unit, category, and brand are required' 
      });
    }
    
    // Check for duplicate name
    const existing = await getOne(
      'SELECT id FROM products WHERE LOWER(name) = LOWER(?)',
      [name]
    );
    
    if (existing) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }
    
    const stockValue = parseInt(stock) || 0;
    const status = stockValue > 0 ? 'In Stock' : 'Out of Stock';
    
    const result = await runQuery(
      `INSERT INTO products (name, unit, category, brand, stock, status, image) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, unit, category, brand, stockValue, status, image || '']
    );
    
    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: result.id,
        name,
        unit,
        category,
        brand,
        stock: stockValue,
        status,
        image
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, category, brand, stock, image } = req.body;
    
    // Get current product
    const currentProduct = await getOne('SELECT * FROM products WHERE id = ?', [id]);
    
    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Validation
    if (!name || !unit || !category || !brand) {
      return res.status(400).json({ 
        message: 'Name, unit, category, and brand are required' 
      });
    }
    
    // Check for duplicate name (excluding current product)
    const duplicate = await getOne(
      'SELECT id FROM products WHERE LOWER(name) = LOWER(?) AND id != ?',
      [name, id]
    );
    
    if (duplicate) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }
    
    const stockValue = parseInt(stock) || 0;
    const status = stockValue > 0 ? 'In Stock' : 'Out of Stock';
    
    // Track inventory history if stock changed
    if (currentProduct.stock !== stockValue) {
      await runQuery(
        `INSERT INTO inventory_history (product_id, old_quantity, new_quantity, changed_by) 
         VALUES (?, ?, ?, ?)`,
        [
          id,
          currentProduct.stock,
          stockValue,
          req.user ? req.user.username : 'System'
        ]
      );
    }
    
    // Update product
    await runQuery(
      `UPDATE products 
       SET name = ?, unit = ?, category = ?, brand = ?, stock = ?, status = ?, image = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, unit, category, brand, stockValue, status, image || '', id]
    );
    
    // Return updated product
    const updatedProduct = await getOne('SELECT * FROM products WHERE id = ?', [id]);
    
    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await getOne('SELECT * FROM products WHERE id = ?', [id]);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await runQuery('DELETE FROM products WHERE id = ?', [id]);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Get product inventory history
const getProductHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const history = await getAll(
      `SELECT * FROM inventory_history 
       WHERE product_id = ? 
       ORDER BY change_date DESC`,
      [id]
    );
    
    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory history' });
  }
};

// Import products from CSV
const importProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const username = req.user ? req.user.username : 'System';
    const results = await importCSV(req.file.path, username);
    
    res.status(201).json({
      message: 'CSV imported successfully',
      ...results
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Failed to import CSV' });
  }
};

// Export products to CSV
const exportProducts = async (req, res) => {
  try {
    const products = await getAll('SELECT * FROM products ORDER BY name ASC');
    
    const csvData = exportToCSV(products);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    res.status(200).send(csvData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export products' });
  }
};

// Get unique categories (for filter dropdown)
const getCategories = async (req, res) => {
  try {
    const categories = await getAll(
      'SELECT DISTINCT category FROM products ORDER BY category ASC'
    );
    
    res.json({ categories: categories.map(c => c.category) });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

module.exports = {
  getProducts,
  searchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductHistory,
  importProducts,
  exportProducts,
  getCategories
};