// backend/src/utils/csvHandler.js
const fs = require('fs');
const csv = require('csv-parser');
const { getOne, runQuery } = require('../../database');

// Parse and import CSV file
const importCSV = async (filePath, username) => {
  return new Promise((resolve, reject) => {
    const results = {
      added: 0,
      skipped: 0,
      duplicates: []
    };
    
    const products = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Validate required fields
        if (row.name && row.unit && row.category && row.brand) {
          products.push({
            name: row.name.trim(),
            unit: row.unit.trim(),
            category: row.category.trim(),
            brand: row.brand.trim(),
            stock: parseInt(row.stock) || 0,
            status: row.status || (parseInt(row.stock) > 0 ? 'In Stock' : 'Out of Stock'),
            image: row.image || ''
          });
        }
      })
      .on('end', async () => {
        try {
          // Process each product
          for (const product of products) {
            // Check for duplicate (case-insensitive)
            const existing = await getOne(
              'SELECT id FROM products WHERE LOWER(name) = LOWER(?)',
              [product.name]
            );
            
            if (existing) {
              results.skipped++;
              results.duplicates.push({
                name: product.name,
                existingId: existing.id
              });
            } else {
              // Insert new product
              await runQuery(
                `INSERT INTO products (name, unit, category, brand, stock, status, image) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  product.name,
                  product.unit,
                  product.category,
                  product.brand,
                  product.stock,
                  product.status,
                  product.image
                ]
              );
              results.added++;
            }
          }
          
          // Delete uploaded file
          fs.unlinkSync(filePath);
          
          resolve(results);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Export products to CSV
const exportToCSV = (products) => {
  // CSV header
  let csv = 'name,unit,category,brand,stock,status,image\n';
  
  // Add each product
  products.forEach(product => {
    csv += `"${product.name}","${product.unit}","${product.category}","${product.brand}",${product.stock},"${product.status}","${product.image || ''}"\n`;
  });
  
  return csv;
};

module.exports = {
  importCSV,
  exportToCSV
};