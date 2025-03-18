import React from 'react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-5xl font-serif font-bold mb-6">
          AI-Powered Website Generator
        </h1>
        <p className="text-xl mb-8">
          Create unique, responsive websites using AI-driven layouts and modular components.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-secondary rounded-lg">
            <h2 className="text-2xl font-serif font-bold mb-4">Sitemap Agent</h2>
            <p>Generates a sitemap defining pages and sections for your website.</p>
          </div>
          <div className="p-6 bg-secondary rounded-lg">
            <h2 className="text-2xl font-serif font-bold mb-4">Brand Guide Agent</h2>
            <p>Creates a style guide with colors, fonts, and UI styles.</p>
          </div>
          <div className="p-6 bg-secondary rounded-lg">
            <h2 className="text-2xl font-serif font-bold mb-4">Code Action Agent</h2>
            <p>Builds the website using sitemap, brand guide, and AI.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 