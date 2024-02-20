import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Tab1.css';
import { useEffect, useState } from 'react';
import DexieService from '../components/DexieService';
import TableContainer from '../components/TableContainer';

const Tab1: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [rawMaterial, setRawMaterials] = useState<any[]>([]);

  useEffect(() => {
    fetchList();
  }, []);
  const findRawMatObjects = (arr1: any, arr2: any): any => {
    const matchingObjects: any[] = [];
    const remainingObjects: any[] = [...arr2];
    for (const obj1 of arr1) {
      const matchingObjIndex = remainingObjects.findIndex((obj2: { mat_name: string; }) => obj2.mat_name === obj1.material_name);
      if (matchingObjIndex !== -1) {
        const matchingObj = remainingObjects.splice(matchingObjIndex, 1)[0];
        matchingObjects.push(matchingObj);
      }
    }
    return { matchingObjects, remainingObjects };
  };
  const fetchList = () => {
    let rawData: never[] = [];
    fetch('../assets/data/table_1.json', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(response => response.json())
      .then(data => {
        rawData = data;
      });


    const dexieService = new DexieService();
    dexieService.getMaterials().then((materials) => {

      const { matchingObjects, remainingObjects } = findRawMatObjects(rawData, materials);
      setMaterials(remainingObjects);
      setRawMaterials(matchingObjects);
    });
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Material Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <h4>Raw Materials</h4>
        {
          (rawMaterial.length > 0) ? <TableContainer material={rawMaterial} /> : <></>
        }
        
        <h4>Shop Materials</h4>
        {
          (materials.length > 0) ?  <TableContainer material={materials} /> : <></>
        }
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
