import React from 'react';
import { MenuCategory, MenuItem } from './types';

interface MenuItemsSectionProps {
  menuCategories: MenuCategory[];
}

const MenuItemsSection: React.FC<MenuItemsSectionProps> = ({ menuCategories }) => {
  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Our Menu</h2>
        {menuCategories.map((category) => (
          <div key={category.id} className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{category.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {category.items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h4>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <p className="text-gray-800 font-bold">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuItemsSection;