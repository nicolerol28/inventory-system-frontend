import { useState, useEffect, useRef, useCallback } from "react";

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Buscar...",
  disabled = false,
}) {
  const selectedOption = options.find((o) => o.id === value) ?? null;

  const [query, setQuery] = useState(selectedOption?.name ?? "");
  const [open, setOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync input text when value changes externally
  useEffect(() => {
    setQuery(selectedOption?.name ?? "");
  }, [value, options]);

  // Debounce
  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);

    if (val === "") {
      onChange(null);
      setDebouncedQuery("");
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(val);
    }, 300);
  }, [onChange]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // Click outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        // Restore input to selected option name if user left mid-typing
        setQuery(selectedOption?.name ?? "");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedOption]);

  const filtered = debouncedQuery.trim()
    ? options.filter((o) =>
        o.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : options;

  const handleSelect = (option) => {
    onChange(option.id);
    setQuery(option.name);
    setDebouncedQuery(option.name);
    setOpen(false);
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => !disabled && setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={inputClass}
      />

      {open && !disabled && filtered.length > 0 && (
        <ul className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
          {filtered.map((option) => (
            <li
              key={option.id}
              onMouseDown={() => handleSelect(option)}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                option.id === value
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}

      {open && !disabled && filtered.length === 0 && query.trim() !== "" && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 px-3 py-2 text-sm text-gray-400 dark:text-gray-600">
          Sin resultados
        </div>
      )}
    </div>
  );
}
