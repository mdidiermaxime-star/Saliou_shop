import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products.js';
import ProductCard from '../components/product/ProductCard.jsx';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!query) return;
    getProducts({ search: query, limit: 24 }).then(setProducts);
  }, [query]);

  return (
    <div className="px-4 py-6">
      <p className="text-sm text-gray-500 mb-1">Résultats pour</p>
      <h1 className="text-xl mb-5">« {query} »</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {products.length === 0 && <p className="text-sm text-gray-400">Aucun produit ne correspond à cette recherche.</p>}
    </div>
  );
}
