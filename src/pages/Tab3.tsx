import { IonButton, IonContent, IonHeader, IonImg, IonInput, IonItem, IonLabel, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import './Tab3.css';
import { useEffect, useState } from 'react';
import DexieService from '../components/DexieService';

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
        const response = await fetch('src/assets/data/materials.json', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const jsonData = await response.json();
        console.log(jsonData);

        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSelectChange = (event: CustomEvent) => {
    setSelectedValue(event.detail.value);
  };

  const handleQuantityChange = (event: CustomEvent) => {
    setQuantity(parseInt(event.detail.value, 10));
  };

  const handleSubmit = async () => {
    // Handle form submission here
    const dexieService = new DexieService();
    dexieService.addMaterial(selectedValue, 0, quantity).then((id) => {
      console.log(id);
    });
    // Optionally, you can clear the form fields after adding the data
    console.log('Selected Option:', selectedValue);
    console.log('Quantity:', quantity);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 3</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonLabel>Select Option</IonLabel>
          <IonSelect value={selectedValue} onIonChange={handleSelectChange}>
            {data.map((item) => (
              <IonSelectOption key={item.material_name} value={item.material_name}>
                {item.material_name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>Quantity</IonLabel>
          <IonInput type="number" value={quantity} onIonChange={handleQuantityChange}></IonInput>
        </IonItem>

        <IonButton type="submit" expand="block" onClick={handleSubmit}>Submit</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;

