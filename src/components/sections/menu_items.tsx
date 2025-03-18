import React from 'react';
import Image from 'next/image';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category?: string;
  image?: string;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuItemsSectionProps {
  title?: string;
  description?: string;
  categories?: MenuCategory[];
  items?: MenuItem[];
}

const MenuItems: React.FC<MenuItemsSectionProps> = ({ 
  title = "Our Menu", 
  description = "Discover our delicious offerings",
  categories = [],
  items = [] 
}) => {
  const defaultItems: MenuItem[] = [
    {
      id: '1',
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and basil',
      price: '14.99'
    },
    {
      id: '2',
      name: 'Tiramisu',
      description: 'Traditional Italian dessert with coffee-soaked ladyfingers',
      price: '8.99'
    }
  ];

  const displayItems = items.length > 0 ? items : defaultItems;

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {description}
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {displayItems.map(item => (
            <div key={item.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between">
                <h3 className="text-xl font-medium text-gray-900">{item.name}</h3>
                <p className="text-lg font-medium text-indigo-600">${item.price}</p>
              </div>
              <p className="mt-2 text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuItems;