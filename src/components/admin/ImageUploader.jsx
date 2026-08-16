import { useState } from 'react';
import { FiUpload, FiX, FiLoader } from 'react-icons/fi';
import { uploadProductImage } from '../../utils/storage.js';

export default function ImageUploader({ imageUrls, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadProductImage(file);
      onChange([...imageUrls, url]);
    } catch (err) {
      setError(err.message || 'Le televersement a echoue');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeImage(index) {
    onChange(imageUrls.filter((_, i) => i !== index));
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">Photos du produit</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {imageUrls.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center">
              <FiX size={12} />
            </button>
          </div>
        ))}
        <label className="w-20 h-20 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer text-gray-400 hover:border-terracotta-400 hover:text-terracotta-400">
          {uploading ? <FiLoader size={18} className="animate-spin" /> : <FiUpload size={18} />}
          <span className="text-[10px]">{uploading ? 'Envoi...' : 'Ajouter'}</span>
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
