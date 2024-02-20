import { IonAvatar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonChip, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonPage, IonRow, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import './Tab2.css';
import { useEffect, useState } from 'react';
import { Item } from './Tab3';
import BuildingService from '../components/BuildingService';
import DexieService from '../components/DexieService';

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
  useEffect(() => {
    fetchList();
    fetchData();
    fetchMaterial();
  }, []);
  const fetchList = () => {
    const buildingService = new BuildingService();
    buildingService.getBuildings().then((list) => {
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
    const buildingService = new BuildingService();
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
        buildingService.addBuilding({ name: bldg.name, buildNo: timestamp, qty: bldg.quantity });
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
    const buildingService = new BuildingService();
    const dexieService = new DexieService();
    const materialData = materialNest;
    buildingService.getBuildings().then((listData) => {
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
            buildingService.deleteBuilding(bldg.id);
          }
        });
      }
    });

  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Building Under Construction</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonButton onClick={handleOpenModal}>Add Material</IonButton>
        <section>
          <IonGrid >
            <IonRow>
              {Object.keys(buildingList).map((buildNoString) => {
                const buildNo = parseInt(buildNoString, 10); // Parse the key back to number
                const cardIndex = Object.keys(buildingList).indexOf(buildNoString);
                return (
                  <IonCol size-xs="12" size-md="4">

                    <IonCard>
                      <IonCardHeader>
                        <IonCardSubtitle key={buildNo}>Building {cardIndex + 1}</IonCardSubtitle>
                      </IonCardHeader>
                      <IonCardContent className='list-item-container'>
                        {buildingList[buildNo].map((item) => (
                          <IonChip>
                            <IonAvatar>
                              <img src={`src/assets/images/${item.name}.png`} alt={item.name} />
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
            <IonButton onClick={handleAdd}>
              Add to Queue
            </IonButton>
            <IonButton onClick={handleCloseModal}>
              Close
            </IonButton>
          </IonModal>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Tab2;
