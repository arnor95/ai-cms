
import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import MenuCategories from '../../../components/generated/MenuCategories';

const MenuPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Menu | Generated Website</title>
      </Head>
      
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Generated Website</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><Link href="/generated/home">Home</Link></li>
              <li><Link href="/generated/about">About</Link></li>
              <li><Link href="/generated/menu">Menu</Link></li>
              <li><Link href="/generated/contact">Contact</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main>
        <MenuCategories />
      </main>
      
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Generated Website</p>
        </div>
      </footer>
    </div>
  );
};

export default MenuPage;
