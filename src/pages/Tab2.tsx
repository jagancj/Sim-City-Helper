import { IonAvatar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonChip, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import './Tab2.css';
import { useEffect, useState } from 'react';
import { Item } from './Tab3';
import DexieService from '../components/DexieService';
import MaterialSelector from '../components/MaterialSelector';

interface ListObject {
  buildNo: number;
  id?: number;
  name: string;
  qty: number;
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
  const [buildingList, setBuildingList] = useState<{ [key: number]: ListObject[] }>([]);
  const [materialNest, setMaterialNest] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    fetchList();
    fetchData();
    fetchMaterial();
  }, [refresh]);
  const fetchList = () => {
    const dexieService = new DexieService();
    dexieService.getBuildings().then((list) => {
      const groupedData: { [key: number]: ListObject[] } = {};
      // Group objects by buildNo
      for (const obj of list) {
        const { buildNo } = obj;
        if (!groupedData[buildNo]) {
          groupedData[buildNo] = [];
        }
        groupedData[buildNo].push(obj);
      }
      setBuildingList(groupedData);
    });
  }

  const fetchData = async () => {
    try {
      const response = await fetch('../assets/data/materials.json', {
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
  const fetchMaterial = async () => {
    const response = await fetch('../assets/data/table_3.json', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    const jsonData = await response.json();
    setMaterialNest(jsonData);
  };
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleAdd = async () => {
    const dexieService = new DexieService();
    const timestamp = new Date().getTime();
    const materialData = materialNest;
    bldgmats.forEach(bldg => {
      const matItem = materialData.filter((response: { item: string; }) => response.item === bldg.name);
      if (matItem.length > 0) {
        const usedItems = matItem[0].mat_used;
        for (const item in usedItems) {
          dexieService.addMaterial(item, 0, bldg.quantity * parseInt(usedItems[item]));
          const useItem = materialData.filter((response: { item: string; }) => response.item === item);
          console.log(useItem);
          if (useItem.length > 0) {
            const tempItem = useItem[0].mat_used;
            for (const item in tempItem) {
              dexieService.addMaterial(item, 0, bldg.quantity * parseInt(tempItem[item]));
            }
          }
        }
      }
      if (bldg.name) {
        dexieService.addBuilding({ name: bldg.name, buildNo: timestamp, qty: bldg.quantity });
      }
    });
    handleCloseModal();
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
  const handleComplete = (buildNo: number) => {
    const dexieService = new DexieService();
    const materialData = materialNest;
    dexieService.getBuildings().then((listData) => {
      if (listData.length > 0) {
        listData.forEach(bldg => {
          const matItem = materialData.filter((response: { item: string; }) => response.item === bldg.name);
          if (matItem.length > 0) {
            const usedItems = matItem[0].mat_used;
            for (const item in usedItems) {
              dexieService.addMaterial(item, -parseInt(usedItems[item]), -parseInt(usedItems[item]));
            }
          }
          if (bldg.id) {
            dexieService.deleteBuilding(bldg.id);
          }
        });
      }
    });
    setRefresh(true);

  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Building Under Construction</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonButton onClick={handleOpenModal}>Add Required Materials </IonButton>
        <section>
          <IonGrid >
            <IonRow>
              {Object.keys(buildingList).map((buildNoString) => {
                const buildNo = parseInt(buildNoString, 10); // Parse the key back to number
                const cardIndex = Object.keys(buildingList).indexOf(buildNoString);
                return (
                  <IonCol size-xs="12" size-md="4">

                    <IonCard key={buildNo}>
                      <IonCardHeader>
                        <IonCardSubtitle >Building {cardIndex + 1}</IonCardSubtitle>
                      </IonCardHeader>
                      <IonCardContent className='list-item-container'>
                        {buildingList[buildNo].map((item) => (
                          <IonChip>
                            <IonAvatar>
                              <img src={`../assets/images/${item.name}.png`} alt={item.name} />
                            </IonAvatar>
                            <IonLabel>{item.name} x {item.qty}</IonLabel>
                          </IonChip>
                        ))}
                      </IonCardContent>
                      <IonButton fill="clear" onClick={() => handleComplete(buildNo)}>Mark Complete</IonButton>
                    </IonCard>
                  </IonCol>

                );
              })}
            </IonRow>
          </IonGrid>
        </section>
        <div>
          <IonModal isOpen={isModalOpen}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Add Building Materials</IonTitle>
                <IonButton slot="end" onClick={handleCloseModal}>Close</IonButton>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <div style={{ padding: '16px' }}>
                {bldgmats.map((mat, index) => (
                  <div key={index} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--ion-color-medium)' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Material {index + 1}</label>
                      <MaterialSelector
                        materials={data}
                        selectedMaterial={mat.name}
                        onSelectionChange={(materialName) => handleMaterialChange(index, materialName)}
                        placeholder="Select a material..."
                      />
                    </div>
                    <div>
                      <IonItem>
                        <IonLabel position="floating">Quantity</IonLabel>
                        <IonInput 
                          type="number" 
                          value={mat.quantity} 
                          onIonChange={(e) => handleQuantityChange(index, parseInt(e.detail.value!, 10))}
                          min="1"
                        />
                      </IonItem>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                <IonButton expand="block" onClick={handleAdd} color="success">
                  Add to Queue
                </IonButton>
              </div>
            </IonContent>
          </IonModal>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Tab2;
