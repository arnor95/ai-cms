'use client';

import React from 'react';
import MenuMenuCategories1 from '../components/MenuMenuCategories1';

export default function MenuPage() {
  return (
    <div className="min-h-screen" style={backgroundColor: '#F1EDEA'}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" style={color: '#4A6C6F', fontFamily: 'Playfair Display, serif'}>Menu</h1>
      <MenuMenuCategories1 />
      </div>
    </div>
  );
}
