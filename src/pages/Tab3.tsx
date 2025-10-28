import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonSearchbar, IonChip, IonBadge } from '@ionic/react';
import './Tab3.css';
import { useEffect, useState } from 'react';
import DexieService from '../components/DexieService';
import { add, remove, checkmarkCircle } from 'ionicons/icons';

export interface Item {
  img: string;
  material_name: string;
}

interface MaterialQuantity {
  name: string;
  img: string;
  quantity: number;
}

const Tab3: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/assets/data/materials.json', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleIncrement = (materialName: string) => {
    setQuantities(prev => ({
      ...prev,
      [materialName]: (prev[materialName] || 0) + 1
    }));
  };

  const handleDecrement = (materialName: string) => {
    setQuantities(prev => {
      const currentQty = prev[materialName] || 0;
      if (currentQty <= 0) return prev;
      
      const newQuantities = { ...prev };
      if (currentQty === 1) {
        delete newQuantities[materialName];
      } else {
        newQuantities[materialName] = currentQty - 1;
      }
      return newQuantities;
    });
  };

  const handleQuantityInput = (materialName: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
      const newQuantities = { ...quantities };
      delete newQuantities[materialName];
      setQuantities(newQuantities);
    } else if (numValue === 0) {
      const newQuantities = { ...quantities };
      delete newQuantities[materialName];
      setQuantities(newQuantities);
    } else {
      setQuantities(prev => ({
        ...prev,
        [materialName]: numValue
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const dexieService = new DexieService();
    
    try {
      // Add all materials with quantities
      const promises = Object.entries(quantities).map(([materialName, qty]) => 
        dexieService.addMaterial(materialName, qty, 0)
      );
      
      await Promise.all(promises);
      
      // Clear quantities and show success
      setQuantities({});
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding materials:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setQuantities({});
  };

  const filteredData = data.filter(item => 
    item.material_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = Object.keys(quantities).length;
  const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add Storage Items</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="storage-container">
          {/* Search Bar */}
          <div className="search-section">
            <IonSearchbar
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value!)}
              placeholder="Search materials..."
              animated
              debounce={300}
            />
          </div>

          {/* Summary Bar */}
          {totalItems > 0 && (
            <div className="summary-bar">
              <div className="summary-stats">
                <IonChip color="primary">
                  <strong>{totalItems}</strong>&nbsp;items selected
                </IonChip>
                <IonChip color="success">
                  <strong>{totalQuantity}</strong>&nbsp;total quantity
                </IonChip>
              </div>
            </div>
          )}

          {/* Materials Grid */}
          <div className="materials-grid">
            {filteredData.map((item) => {
              const qty = quantities[item.material_name] || 0;
              const hasQuantity = qty > 0;

              return (
                <div 
                  key={item.material_name} 
                  className={`material-item ${hasQuantity ? 'selected' : ''}`}
                >
                  <div className="material-image-wrapper">
                    <img
                      src={`/assets/images/${item.img}`}
                      alt={item.material_name}
                      className="material-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                      }}
                    />
                    {hasQuantity && (
                      <IonBadge className="quantity-badge" color="primary">
                        {qty}
                      </IonBadge>
                    )}
                  </div>
                  
                  <div className="material-name">{item.material_name}</div>
                  
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn minus"
                      onClick={() => handleDecrement(item.material_name)}
                      disabled={qty === 0}
                    >
                      <IonIcon icon={remove} />
                    </button>
                    
                    <input
                      type="number"
                      className="qty-input"
                      value={qty || ''}
                      onChange={(e) => handleQuantityInput(item.material_name, e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    
                    <button 
                      className="qty-btn plus"
                      onClick={() => handleIncrement(item.material_name)}
                    >
                      <IonIcon icon={add} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button - Fixed at bottom */}
          {totalItems > 0 && (
            <div className="submit-section">
              <div className="button-group">
                <IonButton 
                  expand="block" 
                  size="large"
                  onClick={handleClear}
                  color="warning"
                  fill="outline"
                >
                  Reset All
                </IonButton>
                <IonButton 
                  expand="block" 
                  size="large"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  color="success"
                >
                  <IonIcon slot="start" icon={checkmarkCircle} />
                  {isSubmitting ? 'Adding...' : `Submit ${totalItems} Item${totalItems > 1 ? 's' : ''}`}
                </IonButton>
              </div>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="success-toast">
              <IonIcon icon={checkmarkCircle} />
              Successfully added to storage!
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;

