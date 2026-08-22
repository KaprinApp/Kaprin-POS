import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Tag } from 'lucide-react';

interface ShortcutInputProps {
  label?: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  storageKey: string;
  defaultShortcuts?: string[];
  extraShortcuts?: string[];
  required?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  subLabel?: React.ReactNode;
}

export const ShortcutInput: React.FC<ShortcutInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'ရိုက်ထည့်ပါ...',
  storageKey,
  defaultShortcuts = [],
  extraShortcuts = [],
  required = false,
  className = '',
  inputClassName = '',
  id,
  subLabel,
}) => {
  const [customList, setCustomList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`pos_shortcuts_${storageKey}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load shortcuts:', e);
    }
    return defaultShortcuts;
  });

  const [removedList, setRemovedList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`pos_shortcuts_removed_${storageKey}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load removed shortcuts:', e);
    }
    return [];
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newShortcutInput, setNewShortcutInput] = useState('');

  // Combine default, custom, and extra dynamic shortcuts (e.g. from database)
  const combinedShortcuts = useMemo(() => {
    const set = new Set<string>();
    // First custom & default items
    customList.forEach((s) => {
      if (s && s.trim()) set.add(s.trim());
    });
    // Extra dynamic items from database
    extraShortcuts.forEach((s) => {
      if (s && s.trim()) set.add(s.trim());
    });
    // Filter out removed items
    return Array.from(set).filter((item) => !removedList.includes(item));
  }, [customList, extraShortcuts, removedList]);

  // Save custom shortcuts to localStorage
  const handleAddShortcut = (itemToAdd?: string) => {
    const target = (itemToAdd || newShortcutInput || value).trim();
    if (!target) return;

    if (removedList.includes(target)) {
      const updatedRemoved = removedList.filter((r) => r !== target);
      setRemovedList(updatedRemoved);
      localStorage.setItem(`pos_shortcuts_removed_${storageKey}`, JSON.stringify(updatedRemoved));
    }

    if (!customList.includes(target)) {
      const updated = [...customList, target];
      setCustomList(updated);
      localStorage.setItem(`pos_shortcuts_${storageKey}`, JSON.stringify(updated));
    }

    onChange(target);
    setNewShortcutInput('');
    setIsAddingNew(false);
  };

  const handleRemoveShortcut = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    e.preventDefault();

    const updatedCustom = customList.filter((s) => s !== itemToRemove);
    setCustomList(updatedCustom);
    localStorage.setItem(`pos_shortcuts_${storageKey}`, JSON.stringify(updatedCustom));

    const updatedRemoved = Array.from(new Set([...removedList, itemToRemove]));
    setRemovedList(updatedRemoved);
    localStorage.setItem(`pos_shortcuts_removed_${storageKey}`, JSON.stringify(updatedRemoved));

    if (value === itemToRemove) {
      onChange('');
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block font-semibold text-gray-700">
            {label}
          </label>
          {subLabel && <span className="text-[10px] text-gray-400 font-normal">{subLabel}</span>}
        </div>
      )}

      {/* Primary Freeform Text Input with Virtual & Physical Keyboard Support */}
      <div className="relative">
        <input
          id={id}
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-900 font-medium focus:outline-none focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] transition-all ${inputClassName}`}
        />
        {value && !combinedShortcuts.includes(value.trim()) && (
          <button
            type="button"
            onClick={() => handleAddShortcut(value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-50 hover:bg-orange-100 text-[#ff6600] border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center space-x-0.5"
            title="ဒီအမည်ကို ဖြတ်လမ်း (Shortcut) အဖြစ် အမြဲမှတ်ထားမည်"
          >
            <Plus className="w-3 h-3" />
            <span>Shortcut မှတ်မည်</span>
          </button>
        )}
      </div>

      {/* Customizable Shortcut Chips / Pills Bar */}
      <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5 shrink-0">
          <Tag className="w-2.5 h-2.5" />
          <span>ဖြတ်လမ်း:</span>
        </span>

        {combinedShortcuts.map((shortcut) => {
          const isSelected = value.trim().toLowerCase() === shortcut.toLowerCase();
          return (
            <div
              key={shortcut}
              onClick={() => onChange(shortcut)}
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer border transition-all select-none ${
                isSelected
                  ? 'bg-orange-500 text-white border-orange-600 shadow-2xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
              }`}
            >
              <span>{shortcut}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveShortcut(e, shortcut)}
                className={`p-0.5 rounded hover:bg-black/10 cursor-pointer ${
                  isSelected ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-red-500'
                }`}
                title={`"${shortcut}" ဖြတ်လမ်းမှ ဖျက်မည်`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}

        {/* Add New Custom Shortcut Chip Button */}
        {isAddingNew ? (
          <div className="inline-flex items-center space-x-1 bg-white border border-[#ff6600] rounded-md px-1.5 py-0.5 animate-in fade-in">
            <input
              type="text"
              autoFocus
              value={newShortcutInput}
              onChange={(e) => setNewShortcutInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddShortcut();
                } else if (e.key === 'Escape') {
                  setIsAddingNew(false);
                }
              }}
              placeholder="အသစ်..."
              className="w-16 text-[10px] bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddShortcut()}
              className="text-[#ff6600] hover:text-orange-700 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center space-x-0.5 text-[10px] font-bold text-gray-500 hover:text-[#ff6600] bg-gray-50 hover:bg-orange-50 border border-dashed border-gray-300 hover:border-[#ff6600] rounded-md px-1.5 py-0.5 cursor-pointer transition-colors"
            title="ဖြတ်လမ်းအသစ် ထည့်သွင်းရန်"
          >
            <Plus className="w-3 h-3" />
            <span>အသစ်ထည့်</span>
          </button>
        )}
      </div>
    </div>
  );
};
