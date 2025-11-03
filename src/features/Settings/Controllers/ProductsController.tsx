import React, { useEffect } from 'react';
import ProductsView from '../Views/ProductsView';

const ProductsController: React.FC = () => {
  useEffect(() => {
    // Initialize products data or perform any setup
    console.log('Products controller mounted');
  }, []);

  return <ProductsView />;
};

export default ProductsController;