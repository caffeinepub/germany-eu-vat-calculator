onChange={(e) => {
  const selected = countries.find(c => c.cca2 === e.target.value);
  if (!selected) return; // prevent undefined crash
  onSelectCountry(selected);
}}
