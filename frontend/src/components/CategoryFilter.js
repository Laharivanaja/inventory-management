import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, selected, onChange }) => {
  return (
    <div className="category-filter">
      <select 
        value={selected} 
        onChange={(e) => onChange(e.target.value)}
        className="category-select"
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category === 'all' ? 'All Categories' : category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;