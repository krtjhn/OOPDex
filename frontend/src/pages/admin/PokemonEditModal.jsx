// Import React hooks
import React, { useEffect, useMemo, useState } from 'react';

// Define default form state
const DEFAULT_FORM = {
    name: '',
    types: '',
    hp: 1,
    attack: 1,
    defense: 1,
    specialAttack: 1,
    specialDefense: 1,
    speed: 1,
    height: '',
    weight: '',
    abilities: '',
    weaknesses: ''
  };

// Helper to convert pokemon object to form data
const toInitialFormData = (pokemon) => {
  // Return default if no pokemon
  if (!pokemon) return { ...DEFAULT_FORM };

  // Merge pokemon data with default form
  return {
    ...DEFAULT_FORM,
    ...pokemon,
    name: pokemon.name || '',
    types: pokemon.types || '',
    abilities: pokemon.abilities || '',
    weaknesses: pokemon.weaknesses || '',
    height: pokemon.height ?? '',
    weight: pokemon.weight ?? ''
  };
};

// Helper to split csv strings
const splitCsv = (value) => {
  // Return empty array if invalid
  if (!value || typeof value !== 'string') return [];
  // Split and trim values
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

// PokemonEditModal component
const PokemonEditModal = ({
  pokemon,
  isOpen,
  onClose,
  onSave,
  typeOptions = [],
  abilityOptions = [],
  weaknessOptions = []
}) => {
  // Initialize form state
  const [formData, setFormData] = useState(() => toInitialFormData(pokemon));

  // Update form data when pokemon changes
  useEffect(() => {
    // Reset state
    setFormData(toInitialFormData(pokemon));
  }, [pokemon]);

  // Memoized parsed types
  const selectedTypes = useMemo(() => splitCsv(formData.types).slice(0, 2), [formData.types]);
  // Memoized parsed abilities
  const selectedAbilities = useMemo(() => splitCsv(formData.abilities), [formData.abilities]);
  // Memoized parsed weaknesses
  const selectedWeaknesses = useMemo(() => splitCsv(formData.weaknesses), [formData.weaknesses]);

  // CSS class for fields
  const fieldClass = 'pokemon-edit-modal__field';
  // CSS class for stat fields
  const statFieldClass = 'pokemon-edit-modal__stat-field';
  // CSS class for multi-selects
  const multiSelectClass = 'pokemon-edit-modal__field pokemon-edit-modal__field--multi';

  // Return null if not open
  if (!isOpen) return null;

  // Form submission handler
  const handleSubmit = (e) => {
    // Prevent default action
    e.preventDefault();
    // Call onSave prop
    onSave(formData);
  };

  // General input change handler
  const handleChange = (e) => {
    // Extract name and value
    const { name, value } = e.target;
    // Check if number input
    const isNumberInput = e.target.type === 'number';

    // If not a number, set string value
    if (!isNumberInput) {
      // Update state
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      // Return early
      return;
    }

    // Handle float values for height/weight
    if (name === 'height' || name === 'weight') {
      // Parse float
      const parsed = value === '' ? '' : Number.parseFloat(value);
      // Set parsed float
      setFormData((prev) => ({
        ...prev,
        [name]: Number.isNaN(parsed) ? '' : parsed
      }));
      // Return early
      return;
    }

    // Handle integer values for stats
    const parsedInt = value === '' ? 0 : Number.parseInt(value, 10);
    // Set parsed integer
    setFormData(prev => ({ 
      ...prev, 
      [name]: Number.isNaN(parsedInt) ? 0 : parsedInt 
    }));
  };

  // Change handler for pokemon types
  const handleTypeChange = (index, value) => {
    // Copy current selected types
    const nextTypes = [...selectedTypes];
    // Set new type at index
    nextTypes[index] = value;

    // Clean up types array
    const cleaned = nextTypes
      .map((type) => (type || '').trim())
      .filter(Boolean)
      .filter((type, itemIndex, arr) => arr.indexOf(type) === itemIndex)
      .slice(0, 2);

    // Update form data with comma-separated string
    setFormData((prev) => ({
      ...prev,
      types: cleaned.join(', ')
    }));
  };

  // Multi-select change handler
  const handleMultiSelectChange = (field, event) => {
    // Get selected options
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    // Update state with joined string
    setFormData((prev) => ({
      ...prev,
      [field]: values.join(', ')
    }));
  };

  return (
    <div
      // Modal Backdrop
      className="pokemon-edit-modal__backdrop fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        // Modal Frame
        className="pokemon-edit-modal__frame w-full max-w-4xl my-auto"
        role="document"
      >
        <div
          // Decorative elements
          className="pokemon-edit-modal__decor"
          aria-hidden="true"
        >
          <span
            // Lens decorative element
            className="pokemon-edit-modal__lens"
          />
          <span
            // Hinge decorative element
            className="pokemon-edit-modal__hinge"
          />
          <span
            // Top slot element
            className="pokemon-edit-modal__slot pokemon-edit-modal__slot--top"
          />
          <span
            // Bottom slot element
            className="pokemon-edit-modal__slot pokemon-edit-modal__slot--bottom"
          />
        </div>
        <div
          // Main screen content
          className="pokemon-edit-modal__screen"
        >
          <div
            // Header container
            className="flex justify-between items-center mb-6"
          >
            <h3
              // Modal title
              className="pokemon-edit-modal__title text-2xl font-bold"
            >
              {`Edit ${pokemon?.name || 'Pokemon'}`}
            </h3>
            <button
              // Close button
              onClick={onClose}
              className="pokemon-edit-modal__close"
              type="button"
              aria-label="Close edit modal"
            >
              <svg
                // Close icon
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form
            // Form container
            onSubmit={handleSubmit}
            className="space-y-6 pokemon-edit-modal__form"
          >
            <div
              // General inputs grid
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div
                // Name input group
                className="space-y-1"
              >
                <label
                  // Name label
                  className="pokemon-edit-modal__label text-xs font-bold uppercase"
                >
                  Name
                </label>
                <input 
                  // Name input
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  className={fieldClass}
                  required
                />
              </div>
              <div
                // Primary type input group
                className="space-y-1"
              >
                <label
                  // Primary type label
                  className="pokemon-edit-modal__label text-xs font-bold uppercase"
                >
                  Primary Type
                </label>
                <select
                  // Primary type select
                  value={selectedTypes[0] || ''}
                  onChange={(event) => handleTypeChange(0, event.target.value)}
                  className={fieldClass}
                  required
                >
                  <option
                    // Default placeholder
                    value=""
                    className="text-black"
                  >
                    Select type
                  </option>
                  {
                    // Loop type options
                    typeOptions.map((type) => (
                      <option key={`type-primary-${type}`} value={type} className="text-black">
                        {type}
                      </option>
                    ))
                  }
                </select>
              </div>
              <div
                // Secondary type input group
                className="space-y-1"
              >
                <label
                  // Secondary type label
                  className="pokemon-edit-modal__label text-xs font-bold uppercase"
                >
                  Secondary Type
                </label>
                <select
                  // Secondary type select
                  value={selectedTypes[1] || ''}
                  onChange={(event) => handleTypeChange(1, event.target.value)}
                  className={fieldClass}
                >
                  <option
                    // None option
                    value=""
                    className="text-black"
                  >
                    None
                  </option>
                  {
                    // Filter and map secondary options
                    typeOptions
                      .filter((type) => type !== (selectedTypes[0] || ''))
                      .map((type) => (
                        <option key={`type-secondary-${type}`} value={type} className="text-black">
                          {type}
                        </option>
                      ))
                  }
                </select>
              </div>
              <div
                // Height input group
                className="space-y-1"
              >
                <label
                  // Height label
                  className="pokemon-edit-modal__label text-xs font-bold uppercase"
                >
                  Height (m)
                </label>
                <input
                  // Height number input
                  name="height"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.height}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
              <div
                // Weight input group
                className="space-y-1"
              >
                <label
                  // Weight label
                  className="pokemon-edit-modal__label text-xs font-bold uppercase"
                >
                  Weight (kg)
                </label>
                <input
                  // Weight number input
                  name="weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
            </div>

            <div
              // Stats inputs grid
              className="pokemon-edit-modal__stats-grid grid grid-cols-3 md:grid-cols-6 gap-3"
            >
              {
                // Map over stat fields
                ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'].map(stat => (
                  <div key={stat} className="pokemon-edit-modal__stat-item">
                    <label
                      // Format and render stat label
                      className="pokemon-edit-modal__label text-[10px] font-bold uppercase"
                    >
                      {stat.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input 
                      // Render stat input field
                      type="number" 
                      name={stat} 
                      value={formData[stat]} 
                      onChange={handleChange}
                      className={statFieldClass}
                      min="1"
                      max="255"
                      required
                    />
                  </div>
                ))
              }
            </div>

            <div
              // Multi-selects grid
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div
                // Abilities select group
                className="space-y-1"
              >
                <label
                  // Abilities label
                  className="pokemon-edit-modal__label text-xs font-bold uppercase"
                >
                  Abilities
                </label>
                <select
                  // Abilities multi-select input
                  multiple
                  value={selectedAbilities}
                  onChange={(event) => handleMultiSelectChange('abilities', event)}
                  className={multiSelectClass}
                >
                  {
                    // Map abilities options
                    abilityOptions.map((ability) => (
                      <option key={`ability-${ability}`} value={ability} className="text-black">
                        {ability}
                      </option>
                    ))
                  }
                </select>
                <p
                  // Usage hint
                  className="pokemon-edit-modal__hint text-[11px]"
                >
                  Hold Ctrl/Cmd to select multiple abilities.
                </p>
              </div>
              <div
                // Weaknesses select group
                className="space-y-1"
              >
                <label
                  // Weaknesses label
                  className="pokemon-edit-modal__label text-xs font-bold uppercase"
                >
                  Weaknesses
                </label>
                <select
                  // Weaknesses multi-select input
                  multiple
                  value={selectedWeaknesses}
                  onChange={(event) => handleMultiSelectChange('weaknesses', event)}
                  className={multiSelectClass}
                >
                  {
                    // Map weaknesses options
                    weaknessOptions.map((weakness) => (
                      <option key={`weakness-${weakness}`} value={weakness} className="text-black">
                        {weakness}
                      </option>
                    ))
                  }
                </select>
                <p
                  // Usage hint
                  className="pokemon-edit-modal__hint text-[11px]"
                >
                  Hold Ctrl/Cmd to select multiple weaknesses.
                </p>
              </div>
            </div>

            <div
              // Action buttons footer
              className="flex justify-end gap-3 mt-8"
            >
              <button 
                // Cancel button
                type="button" 
                onClick={onClose}
                className="pokemon-edit-modal__btn pokemon-edit-modal__btn--ghost px-6 py-2 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button 
                // Submit save button
                type="submit"
                className="pokemon-edit-modal__btn pokemon-edit-modal__btn--primary px-8 py-2 rounded-xl font-bold"
              >
                Update Pokemon
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Export PokemonEditModal component
export default PokemonEditModal;
