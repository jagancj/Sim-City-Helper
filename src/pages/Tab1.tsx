import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import DexieService from '../components/DexieService';
import './Tab1.css';

// Constants
const HEADER_ROW_MATERIAL_NAME = 'Material';

interface TabProps {
  tab: string;
  isActive: boolean; 
}

interface Material {
  id?: number;
  mat_name: string;
  haveQty: number;
  requiredQty: number;
}

interface MaterialInfo {
  material_name: string;
  unlocked_at: string;
  production_time: string;
  msp: string;
  spm: string;
  used_in: string;
}

interface UnifiedMaterial {
  name: string;
  haveQty: number;
  requiredQty: number;
  sources: ('factory' | 'shop')[];
  productionTime?: string;
  unlockedAt?: string;
  status: 'complete' | 'partial' | 'needed';
}

// SVG Icons as components
const FactoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 20h20M2 20V9l5 3v-2l5 3v-2l5 3v7M6 20v-4h4v4M14 20v-4h4v4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Tab1: React.FC<TabProps> = ({isActive}) => {
  const [unifiedMaterials, setUnifiedMaterials] = useState<UnifiedMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<UnifiedMaterial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSource, setFilterSource] = useState<'all' | 'factory' | 'shop'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial' | 'needed'>('all');

  useEffect(() => {
    if(isActive) fetchList();
  }, [isActive]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterSource, filterStatus, unifiedMaterials]);

  const fetchList = () => {
    const dexieService = new DexieService();
    dexieService.getMaterials().then((materials) => {
      Promise.all([
        fetch('/assets/data/table_1.json', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).then(response => response.json()),
        fetch('/assets/data/materials.json', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).then(response => response.json())
      ]).then(([table1Data, materialsData]) => {
        // Create material info lookup
        const infoMap: { [key: string]: MaterialInfo } = {};
        table1Data.forEach((item: MaterialInfo) => {
          if (item.material_name && item.material_name !== HEADER_ROW_MATERIAL_NAME) {
            infoMap[item.material_name] = item;
          }
        });

        // Separate raw and shop materials
        const rawMats: Material[] = [];
        const shopMats: Material[] = [];

        materials.forEach(mat => {
          if (infoMap[mat.mat_name]) {
            rawMats.push(mat);
          } else {
            shopMats.push(mat);
          }
        });

        // Create unified list (club duplicates)
        const unified = unifyMaterials(rawMats, shopMats, infoMap);
        setUnifiedMaterials(unified);
        setIsLoading(false);
      });
    });
  };

  const unifyMaterials = (rawMats: Material[], shopMats: Material[], infoMap: { [key: string]: MaterialInfo }): UnifiedMaterial[] => {
    const materialMap = new Map<string, UnifiedMaterial>();

    // Process raw materials (from factory)
    rawMats.forEach(mat => {
      const info = infoMap[mat.mat_name];
      const status = getStatus(mat.haveQty, mat.requiredQty);
      materialMap.set(mat.mat_name, {
        name: mat.mat_name,
        haveQty: mat.haveQty,
        requiredQty: mat.requiredQty,
        sources: ['factory'],
        productionTime: info?.production_time,
        unlockedAt: info?.unlocked_at,
        status
      });
    });

    // Process shop materials (manufactured)
    shopMats.forEach(mat => {
      if (materialMap.has(mat.mat_name)) {
        // Material exists in both sources - add 'shop' source
        const existing = materialMap.get(mat.mat_name)!;
        existing.sources.push('shop');
        // Combine quantities
        existing.haveQty += mat.haveQty;
        existing.requiredQty += mat.requiredQty;
        existing.status = getStatus(existing.haveQty, existing.requiredQty);
      } else {
        // New shop-only material
        const status = getStatus(mat.haveQty, mat.requiredQty);
        materialMap.set(mat.mat_name, {
          name: mat.mat_name,
          haveQty: mat.haveQty,
          requiredQty: mat.requiredQty,
          sources: ['shop'],
          productionTime: undefined,
          unlockedAt: undefined,
          status
        });
      }
    });

    return Array.from(materialMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const getStatus = (have: number, required: number): 'complete' | 'partial' | 'needed' => {
    if (have >= required) return 'complete';
    if (have > 0) return 'partial';
    return 'needed';
  };

  const applyFilters = () => {
    let filtered = [...unifiedMaterials];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(mat => 
        mat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Source filter
    if (filterSource !== 'all') {
      filtered = filtered.filter(mat => mat.sources.includes(filterSource));
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(mat => mat.status === filterStatus);
    }

    setFilteredMaterials(filtered);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'complete': return '#10b981';
      case 'partial': return '#f59e0b';
      case 'needed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPercentage = (have: number, required: number) => {
    if (required === 0) return 0;
    return Math.min(100, Math.round((have / required) * 100));
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Material Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="tab1-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading materials...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const stats = {
    total: unifiedMaterials.length,
    complete: unifiedMaterials.filter(m => m.status === 'complete').length,
    partial: unifiedMaterials.filter(m => m.status === 'partial').length,
    needed: unifiedMaterials.filter(m => m.status === 'needed').length
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Material Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="tab1-content">
        
        {/* Header Stats */}
        <div className="dashboard-header">
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Materials</div>
            </div>
            <div className="stat-card stat-complete">
              <div className="stat-value">{stats.complete}</div>
              <div className="stat-label">Complete</div>
            </div>
            <div className="stat-card stat-partial">
              <div className="stat-value">{stats.partial}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card stat-needed">
              <div className="stat-value">{stats.needed}</div>
              <div className="stat-label">Needed</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="controls-section">
          <div className="search-box">
            <SearchIcon />
            <input 
              type="text" 
              placeholder="Search materials..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-btn" onClick={() => setSearchTerm('')}>×</button>
            )}
          </div>

          <div className="filter-chips">
            <div className="chip-group">
              <span className="chip-label">Source:</span>
              <button 
                className={`filter-chip ${filterSource === 'all' ? 'active' : ''}`}
                onClick={() => setFilterSource('all')}
              >
                All
              </button>
              <button 
                className={`filter-chip ${filterSource === 'factory' ? 'active' : ''}`}
                onClick={() => setFilterSource('factory')}
              >
                <FactoryIcon /> Factory
              </button>
              <button 
                className={`filter-chip ${filterSource === 'shop' ? 'active' : ''}`}
                onClick={() => setFilterSource('shop')}
              >
                <ShopIcon /> Shop
              </button>
            </div>

            <div className="chip-group">
              <span className="chip-label">Status:</span>
              <button 
                className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button 
                className={`filter-chip status-complete ${filterStatus === 'complete' ? 'active' : ''}`}
                onClick={() => setFilterStatus('complete')}
              >
                Complete
              </button>
              <button 
                className={`filter-chip status-partial ${filterStatus === 'partial' ? 'active' : ''}`}
                onClick={() => setFilterStatus('partial')}
              >
                In Progress
              </button>
              <button 
                className={`filter-chip status-needed ${filterStatus === 'needed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('needed')}
              >
                Needed
              </button>
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="materials-section">
          {filteredMaterials.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>No materials found</p>
              <span>Try adjusting your filters</span>
            </div>
          ) : (
            <div className="materials-grid-unified">
              {filteredMaterials.map((mat) => {
                const percentage = getPercentage(mat.haveQty, mat.requiredQty);
                const shortage = mat.requiredQty - mat.haveQty;

                return (
                  <div key={mat.name} className={`material-card-unified status-${mat.status}`}>
                    {/* Card Header */}
                    <div className="card-top">
                      <div className="material-header">
                        <img 
                          src={`/assets/images/${mat.name}.png`} 
                          alt={mat.name}
                          className="material-thumb"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                          }}
                        />
                        <div className="material-info">
                          <h3 className="material-name">{mat.name}</h3>
                          <div className="source-badges">
                            {mat.sources.map(source => (
                              <span key={source} className={`source-badge source-${source}`}>
                                {source === 'factory' ? <FactoryIcon /> : <ShopIcon />}
                                <span>{source === 'factory' ? 'Factory' : 'Shop'}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className={`status-badge status-${mat.status}`}>
                        {mat.status === 'complete' ? '✓' : mat.status === 'partial' ? '◐' : '○'}
                      </div>
                    </div>

                    {/* Quantities */}
                    <div className="quantities">
                      <div className="qty-item">
                        <span className="qty-label">Have</span>
                        <span className="qty-value have-qty">{mat.haveQty}</span>
                      </div>
                      <div className="qty-divider">→</div>
                      <div className="qty-item">
                        <span className="qty-label">Need</span>
                        <span className="qty-value need-qty">{mat.requiredQty}</span>
                      </div>
                      <div className="qty-divider">≡</div>
                      <div className="qty-item">
                        <span className="qty-label">Left</span>
                        <span className={`qty-value remaining-qty ${shortage <= 0 ? 'positive' : 'negative'}`}>
                          {shortage <= 0 ? '+' + Math.abs(shortage) : shortage}
                        </span>
                      </div>
                    </div>

                    {/* Production Time */}
                    {mat.productionTime && (
                      <div className="production-time">
                        <ClockIcon />
                        <span>{mat.productionTime}</span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getStatusColor(mat.status)
                        }}
                      >
                        <span className="progress-label">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
