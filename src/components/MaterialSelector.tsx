import React, { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmark, close, search } from 'ionicons/icons';
import './MaterialSelector.css';

interface MaterialInfo {
  img: string;
  material_name: string;
  category?: string;
  tier?: number;
}

interface MaterialSelectorProps {
  materials: MaterialInfo[];
  selectedMaterial?: string;
  onSelectionChange: (materialName: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  materials,
  selectedMaterial,
  onSelectionChange,
  placeholder = "Select a material",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const triggerTop = rect.top;
      const triggerLeft = rect.left + rect.width / 2;
      const viewportHeight = window.innerHeight;
      
      // Check if there's more space above or below
      const spaceAbove = triggerTop;
      const spaceBelow = viewportHeight - (triggerTop + rect.height);
      
      let top: number;
      if (spaceAbove > spaceBelow) {
        // Position above
        top = triggerTop - 10;
      } else {
        // Position below
        top = triggerTop + rect.height + 10;
      }

      setDropdownStyle({
        top: `${top}px`,
        left: `${triggerLeft}px`,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && dropdownRef.current) {
        if (!triggerRef.current.contains(event.target as Node) && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Early return after all hooks
  if (!materials || !Array.isArray(materials) || materials.length === 0) {
    return <div className="selector-trigger empty">Loading materials...</div>;
  }

  const filteredMaterials = materials.filter(material =>
    material?.material_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMaterialData = materials.find(m => m?.material_name === selectedMaterial);

  const handleMaterialSelect = (materialName: string) => {
    onSelectionChange(materialName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getImagePath = (imageName: string) => {
    const cleanName = imageName.replace(/\.(png|jpg|jpeg|webp)$/i, '');
    return `/assets/images/${cleanName}.png`;
  };

  return (
    <div className="material-selector-wrapper">
      <div
        ref={triggerRef}
        className={`selector-trigger ${disabled ? 'disabled' : ''} ${isOpen ? 'active' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedMaterialData ? (
          <>
            <div className="trigger-content">
              <img src={getImagePath(selectedMaterialData.img)} alt={selectedMaterialData.material_name} className="trigger-image" />
              <div className="trigger-text">
                <div className="trigger-name">{selectedMaterialData.material_name}</div>
                {selectedMaterialData.category && <div className="trigger-category">{selectedMaterialData.category}</div>}
              </div>
            </div>
          </>
        ) : (
          <div className="trigger-placeholder">{placeholder}</div>
        )}
        <IonIcon icon={isOpen ? close : search} className="trigger-icon" />
      </div>

      {isOpen && (
        <>
          <div className="dropdown-backdrop" onClick={() => setIsOpen(false)}></div>
          <div ref={dropdownRef} className="dropdown-menu" style={dropdownStyle}>
          <div className="dropdown-header">
            <h3>Select Material</h3>
          </div>
          
          <div className="dropdown-search-wrapper">
            <IonIcon icon={search} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <IonIcon icon={close} className="clear-icon" onClick={() => setSearchTerm('')} />
            )}
          </div>

          <div className="dropdown-list">
            {filteredMaterials.length === 0 ? (
              <div className="no-results">No materials found</div>
            ) : (
              filteredMaterials.map((material) => (
                <div
                  key={material.material_name}
                  className={`dropdown-item ${material.material_name === selectedMaterial ? 'selected' : ''}`}
                  onClick={() => handleMaterialSelect(material.material_name)}
                >
                  <img src={getImagePath(material.img)} alt={material.material_name} className="item-image" />
                  <div className="item-content">
                    <div className="item-name">{material.material_name}</div>
                    {material.category && <div className="item-category">{material.category}</div>}
                  </div>
                  {material.material_name === selectedMaterial && (
                    <IonIcon icon={checkmark} className="item-checkmark" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export { MaterialSelector };
export default MaterialSelector;
