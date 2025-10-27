import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Tab3.css';
import { useEffect, useState } from 'react';
import DexieService from '../components/DexieService';
import MaterialSelector from '../components/MaterialSelector';

export interface Item {
  img: string;
  material_name: string;
}

const Tab3: React.FC = () => {

  const [quantity, setQuantity] = useState<number>(1);
  const [data, setData] = useState<Item[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>('');

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

  const handleQuantityChange = (event: CustomEvent) => {
    setQuantity(parseInt(event.detail.value, 10));
  };

  const handleSubmit = async () => {
    const dexieService = new DexieService();
    dexieService.addMaterial(selectedValue, quantity, 0).then(id => {
      if(id) {
        setSelectedValue('');
        setQuantity(1);
      }
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add Your Storage Items</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Material</label>
            <MaterialSelector
              materials={data}
              selectedMaterial={selectedValue}
              onSelectionChange={setSelectedValue}
              placeholder="Choose a material to add..."
            />
          </div>

          <IonItem>
            <IonLabel position="floating">Quantity</IonLabel>
            <IonInput 
              type="number" 
              value={quantity} 
              onIonChange={handleQuantityChange}
              min="1"
            />
          </IonItem>

          <IonButton 
            type="submit" 
            expand="block" 
            onClick={handleSubmit}
            style={{ marginTop: '16px' }}
            disabled={!selectedValue}
          >
            Add to Storage
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;

