'use client';

import React from 'react';
import ContactContactInformation1 from '../components/ContactContactInformation1';

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={backgroundColor: '#F1EDEA'}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" style={color: '#4A6C6F', fontFamily: 'Playfair Display, serif'}>Contact</h1>
      <ContactContactInformation1 />
      </div>
    </div>
  );
}
