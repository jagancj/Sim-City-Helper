import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonPage, IonRow, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import './Tab2.css';
import { useEffect, useState } from 'react';
import DexieService from '../components/DexieService';
import { Item } from './Tab3';

interface MaterialFormProps {
  onSubmit: (bldgmatrl: { name: string; quantity: number }) => void;
}

const Tab2: React.FC = () => {

  const [bldgmats, setBldgmats] = useState<{ name: string; quantity: number }[]>([
    { name: '', quantity: 1 },
    { name: '', quantity: 1 },
    { name: '', quantity: 1 },
    { name: '', quantity: 1 },
    { name: '', quantity: 1 },
    { name: '', quantity: 1 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<Item[]>([]);

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  }; 
  // @TODO Handle Dexie add materials here
  const handleAdd = () => {
    console.log(bldgmats);
    const dexieService = new DexieService();
    bldgmats.forEach(bldg => {
      dexieService.addBuilding({name: bldg.name, qty: bldg.quantity}).then((id) => {
        console.log(id);
        handleCloseModal();
      });
    })
  };

  const handleMaterialChange = (index: number, name: string) => {
    const newMaterials = [...bldgmats];
    newMaterials[index].name = name;
    setBldgmats(newMaterials);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newMaterials = [...bldgmats];
    newMaterials[index].quantity = quantity;
    setBldgmats(newMaterials);
  };


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 2</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <IonButton onClick={handleOpenModal}>Add Material</IonButton>
      <div>
      <IonModal isOpen={isModalOpen}>
      <IonGrid>
        {bldgmats.map((mat, index) => (
          <IonRow key={index}>
            <IonCol size="8">
              <IonItem>
                <IonLabel position="floating">Material</IonLabel>
                <IonSelect value={mat.name} onIonChange={(e) => handleMaterialChange(index, e.detail.value)}>
                {data.map((item) => (
                  <IonSelectOption key={item.material_name} value={item.material_name}>
                    {item.material_name}
                  </IonSelectOption>
                ))}
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol size="4">
              <IonItem>
                <IonLabel position="floating">Quantity</IonLabel>
                <IonInput type="number" value={mat.quantity} onIonChange={(e) => handleQuantityChange(index, parseInt(e.detail.value!, 10))}></IonInput>
              </IonItem>
            </IonCol>
          </IonRow>
        ))}
      </IonGrid>
      <IonButton  onClick={handleAdd}>
        Add to Queue
      </IonButton>
      <IonButton  onClick={handleCloseModal}>
        Close
      </IonButton>
      </IonModal>
      </div>
    
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
