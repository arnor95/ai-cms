'use client';

import React from 'react';
import LocationHoursofOperation1 from '../components/LocationHoursofOperation1';

export default function LocationPage() {
  return (
    <div className="min-h-screen" style={backgroundColor: '#F1EDEA'}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" style={color: '#4A6C6F', fontFamily: 'Playfair Display, serif'}>Location</h1>
      <LocationHoursofOperation1 />
      </div>
    </div>
  );
}
