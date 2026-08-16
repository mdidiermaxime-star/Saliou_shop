import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase.js';

export default function AdminClients() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setUsers(data || []));
  }, []);

  return (
    <div>
      <h1 className="text-xl mb-1">Clients</h1>
      <p className="text-xs text-gray-500 mb-5">{users.length} comptes créés</p>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2.5 bg-gray-50 text-xs text-gray-500 font-medium">
          <span>Nom</span><span>Téléphone</span><span>Rôle</span><span>Inscrit le</span>
        </div>
        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-4 px-4 py-3 border-t border-gray-100 text-sm">
            <span>{u.full_name}</span>
            <span>{u.phone}</span>
            <span className={`w-fit text-xs px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-terracotta-50 text-terracotta-600' : 'bg-gray-100 text-gray-500'}`}>{u.role}</span>
            <span className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
