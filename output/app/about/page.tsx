'use client';

import React from 'react';
import AboutRestaurantStory1 from '../components/AboutRestaurantStory1';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={backgroundColor: '#F1EDEA'}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" style={color: '#4A6C6F', fontFamily: 'Playfair Display, serif'}>About</h1>
      <AboutRestaurantStory1 />
      </div>
    </div>
  );
}
