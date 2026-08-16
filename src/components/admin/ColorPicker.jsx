const PRESET_COLORS = [
  { name: 'Noir', hex: '#1A1A1A' }, { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Gris', hex: '#9CA3AF' }, { name: 'Bleu marine', hex: '#1E3A5F' },
  { name: 'Bleu ciel', hex: '#85B7EB' }, { name: 'Rouge', hex: '#C0392B' },
  { name: 'Vert', hex: '#3E7C4A' }, { name: 'Beige', hex: '#D8C3A5' },
  { name: 'Marron', hex: '#6B4226' }, { name: 'Rose', hex: '#E8A0BF' },
];

export default function ColorPicker({ value, onChange }) {
  const matchedPreset = PRESET_COLORS.find((c) => c.hex.toLowerCase() === (value || '').toLowerCase());
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {PRESET_COLORS.map((c) => (
          <button key={c.hex} type="button" title={c.name} onClick={() => onChange(c.hex)}
            className={`w-6 h-6 rounded-full border-2 ${value?.toLowerCase() === c.hex.toLowerCase() ? 'border-charcoal' : 'border-transparent'}`}
            style={{ backgroundColor: c.hex, boxShadow: c.hex === '#FFFFFF' ? 'inset 0 0 0 1px #E5E7EB' : undefined }} />
        ))}
        <label title="Couleur personnalisée"
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer text-[10px] ${!matchedPreset && value ? 'border-charcoal' : 'border-gray-300'}`}
          style={{ backgroundColor: !matchedPreset && value ? value : '#fff' }}>
          {!matchedPreset && value ? '' : '+'}
          <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="opacity-0 w-0 h-0 absolute" />
        </label>
      </div>
      <p className="text-[11px] text-gray-400">{matchedPreset ? matchedPreset.name : value || 'Choisis une couleur'}</p>
    </div>
  );
}
