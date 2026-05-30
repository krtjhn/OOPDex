// Import React and hooks
import React, { useCallback, useEffect, useState } from 'react';
// Import API client
import apiClient from '../../api/axios';
// Import edit modal
import PokemonEditModal from './PokemonEditModal';
// Import toast hook
import { useToast } from '../../components/Toast';
// Import confirm modal
import ConfirmModal from '../../components/ConfirmModal';
// Import pokemon card component
import PokemonCard from '../../components/pokemon/PokemonCard';
// Import pokemon detail modal component
import PokemonDetailModal from '../../components/pokemon/PokemonDetailModal';
// Import pokemon database shell component
import PokemonDatabaseShell from '../../components/pokemon/PokemonDatabaseShell';
// Import utility functions
import { POKEMON_TYPES, filterPokemonList } from '../../utils/pokemonCatalog';
// Import image path utility
import { getPokemonSpritePath } from '../../utils/pokemonMedia';
// Define logo path
const PokedexLogo = '/assets/images/Pokedex.png';

// Split CSV string utility function
const splitCsv = (value) => {
  // Return empty array if invalid value
  if (!value || typeof value !== 'string') return [];
  // Split by comma
  return value
    .split(',')
    // Trim whitespace
    .map((item) => item.trim())
    // Remove empty values
    .filter(Boolean);
};

// Get unique sorted values from CSV field
const uniqueSortedFromCsvField = (rows, field) => {
  // Initialize Set for unique values
  const values = new Set();
  // Loop through rows
  (rows || []).forEach((row) => {
    // Split field and add items to Set
    splitCsv(row?.[field]).forEach((item) => values.add(item));
  });
  // Return sorted array
  return Array.from(values).sort((left, right) => left.localeCompare(right));
};

// Pokemon Database Component
const PokemonDatabase = () => {
  // State for pokemon list
  const [pokemonList, setPokemonList] = useState([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for selected type filter
  const [selectedType, setSelectedType] = useState('All');
  // State for search term filter
  const [searchTerm, setSearchTerm] = useState('');
  // State for currently editing pokemon
  const [editingPokemon, setEditingPokemon] = useState(null);
  // State for deletion confirmation
  const [confirmDelete, setConfirmDelete] = useState(null);
  // State for current view mode
  const [viewMode, setViewMode] = useState('active');
  // State for detailed pokemon view
  const [detailPokemon, setDetailPokemon] = useState(null);
  // Destructure showToast from hook
  const { showToast } = useToast();

  // Effect to fetch pokemon on view mode change
  useEffect(() => {
    // Call fetch function
    fetchPokemon();
  }, [viewMode]);

  // Fetch pokemon function
  const fetchPokemon = async () => {
    // Set loading true
    setLoading(true);
    try {
      // Determine endpoint based on view mode
      const endpoint = viewMode === 'active' ? '/pokemon' : '/admin/pokemon/deleted';
      // Make API request
      const response = await apiClient.get(endpoint, { meta: { suppressGlobalErrorToast: true } });
      // Update list state
      setPokemonList(Array.isArray(response.data) ? response.data : []);
    } catch {
      // Show error toast
      showToast('Failed to load Pokemon', 'error');
      // Clear list state
      setPokemonList([]);
    } finally {
      // Set loading false
      setLoading(false);
    }
  };

  // Helper to get API error message
  const getApiErrorMessage = (error, fallback) => {
    // Get errors object
    const errors = error.response?.data?.errors;
    // Check if errors object exists
    if (errors && typeof errors === 'object') {
      // Return first error value
      return Object.values(errors)[0] || fallback;
    }
    // Return fallback message
    return error.response?.data?.message || fallback;
  };

  // Save edit handler
  const handleSave = async (formData) => {
    // Check if editing
    if (!editingPokemon) return;

    try {
      // Make PUT request to update pokemon
      const response = await apiClient.put(`/admin/pokemon/${editingPokemon.id}`, formData, { meta: { suppressGlobalErrorToast: true } });
      // Update item in list
      setPokemonList((prev) => prev.map((pokemon) => (pokemon.id === response.data.id ? response.data : pokemon)));
      // Show success toast
      showToast(`${response.data.name} updated successfully!`, 'success');
      // Close editing modal
      setEditingPokemon(null);
    } catch (error) {
      // Show error toast
      showToast(getApiErrorMessage(error, 'Failed to save entry.'), 'error');
    }
  };

  // Delete handler
  const handleDelete = async () => {
    // Check confirmation
    if (!confirmDelete) return;

    try {
      if (viewMode === 'active') {
        // Soft delete active pokemon
        await apiClient.delete(`/admin/pokemon/${confirmDelete.id}`, { meta: { suppressGlobalErrorToast: true } });
        // Remove from current list
        setPokemonList((prev) => prev.filter((pokemon) => pokemon.id !== confirmDelete.id));
        // Show info toast
        showToast(`${confirmDelete.name} moved to Recycle Bin.`, 'info');
      } else {
        // Permanent delete
        await apiClient.delete(`/admin/pokemon/${confirmDelete.id}/permanent`, { meta: { suppressGlobalErrorToast: true } });
        // Remove from current list
        setPokemonList((prev) => prev.filter((pokemon) => pokemon.id !== confirmDelete.id));
        // Show info toast
        showToast(`${confirmDelete.name} permanently deleted.`, 'info');
      }
      // Clear delete confirmation state
      setConfirmDelete(null);
    } catch {
      // Show error toast
      showToast('Deletion failed.', 'error');
    }
  };

  // Restore handler
  const handleRestore = async (pokemon) => {
    try {
      // Make POST request to restore
      await apiClient.post(`/admin/pokemon/${pokemon.id}/restore`, null, { meta: { suppressGlobalErrorToast: true } });
      // Remove from deleted list
      setPokemonList((prev) => prev.filter((p) => p.id !== pokemon.id));
      // Show success toast
      showToast(`${pokemon.name} restored successfully!`, 'success');
      // Close detail view
      setDetailPokemon(null);
    } catch {
      // Show error toast
      showToast('Failed to restore Pokemon.', 'error');
    }
  };

  // Filter and sort pokemon list
  const filteredPokemon = filterPokemonList(pokemonList, searchTerm, selectedType)
    // Create a copy
    .slice()
    // Sort by ID
    .sort((left, right) => (left.id || 0) - (right.id || 0));

  // Remove 'All' from type options for select dropdowns
  const typeOptions = POKEMON_TYPES.filter((type) => type !== 'All');
  // Get unique abilities
  const abilityOptions = uniqueSortedFromCsvField(pokemonList, 'abilities');
  // Get unique weaknesses
  const weaknessOptions = uniqueSortedFromCsvField(pokemonList, 'weaknesses');

  // Handle card click
  const handleCardClick = useCallback((pokemon) => {
    // Set detail pokemon
    setDetailPokemon(pokemon);
  }, []);

  return (
    <div
      // Main container with font family
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      <div
        // Top navigation row
        className="flex justify-center mb-6"
      >
        <div
          // Toggle container
          className="bg-white rounded-full p-1 shadow-sm border border-slate-200 inline-flex"
        >
          <button
            // Active Database tab button
            className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${viewMode === 'active' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setViewMode('active')}
          >
            Active Database
          </button>
          <button
            // Recently Deleted tab button
            className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${viewMode === 'deleted' ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setViewMode('deleted')}
          >
            Recently Deleted
          </button>
        </div>
      </div>

      <div
        // Database Shell Container
        style={{ position: 'relative', paddingTop: 0, marginTop: 0, zIndex: 1 }}
      >
        <div
          // Constrain width
          style={{ maxWidth: '100%', padding: 0 }}
        >
          <PokemonDatabaseShell
            // Render shell component with search and filters
            title={<img src={PokedexLogo} alt="Pokémon Database" className="pokemon-database-shell__title-image" draggable={false} />}
            count={filteredPokemon.length}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedType={selectedType}
            onSelectedTypeChange={setSelectedType}
            types={POKEMON_TYPES}
            loading={loading}
            loadingMessage="Accessing Professor Oak's database..."
          >
            {
              // Map filtered list to card components
              filteredPokemon.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  imageSrc={getPokemonSpritePath(pokemon.id)}
                  onClick={() => handleCardClick(pokemon)}
                />
              ))
            }
          </PokemonDatabaseShell>
        </div>
      </div>

      {
        // Conditionally render Detail Modal
        detailPokemon && (
          <PokemonDetailModal
            pokemon={detailPokemon}
            onClose={() => setDetailPokemon(null)}
            showAdminActions={true}
            viewMode={viewMode}
            onEdit={(pokemon) => {
              // Handle edit click from detail view
              setDetailPokemon(null);
              setEditingPokemon(pokemon);
            }}
            onDelete={(pokemon) => {
              // Handle delete click from detail view
              setDetailPokemon(null);
              setConfirmDelete(pokemon);
            }}
            onRestore={handleRestore}
            onPermanentDelete={(pokemon) => {
              // Handle permanent delete from detail view
              setDetailPokemon(null);
              setConfirmDelete(pokemon);
            }}
          />
        )
      }

      {
        // Conditionally render Edit Modal
        editingPokemon && (
          <PokemonEditModal
            pokemon={editingPokemon}
            isOpen={true}
            typeOptions={typeOptions}
            abilityOptions={abilityOptions}
            weaknessOptions={weaknessOptions}
            onClose={() => {
              // Close edit modal and return to detail view
              setDetailPokemon(editingPokemon);
              setEditingPokemon(null);
            }}
            onSave={handleSave}
          />
        )
      }

      {
        // Conditionally render Confirm Delete Modal
        confirmDelete && (
          <ConfirmModal
            isOpen={true}
            title={viewMode === 'active' ? "Move to Recycle Bin?" : "Permanently Delete?"}
            message={viewMode === 'active' 
              ? `Are you sure you want to move ${confirmDelete.name} to the Recycle Bin? It will be hidden from trainers.` 
              : `Are you sure you want to permanently delete ${confirmDelete.name}? This will remove it from all trainer collections globally.`}
            confirmText={viewMode === 'active' ? "Move to Bin" : "Permanently Delete"}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(null)}
          />
        )
      }
    </div>
  );
};

// Export the database component
export default PokemonDatabase;
