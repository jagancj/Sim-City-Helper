import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import DexieService from '../components/DexieService';
import TableContainer from '../components/TableContainer';

interface TabProps {
  tab: string;
  isActive: boolean; 
}

const Tab1: React.FC<TabProps> = ({isActive}) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [rawMaterial, setRawMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // State to track loading status

  useEffect(() => {
    if(isActive)fetchList();
  }, [isActive]);

  const fetchList = () => {
    const dexieService = new DexieService();
    dexieService.getMaterials().then((materials) => {
      fetch('../assets/data/table_1.json', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }).then(response => response.json())
        .then(data => {
          const { matchingObjects, remainingObjects } = findRawMatObjects(data, materials);
          setMaterials(remainingObjects);
          setRawMaterials(matchingObjects);
          setIsLoading(false); // Set loading state to false once data is fetched
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setIsLoading(false); // Set loading state to false if there's an error
        });
    }).catch(error => {
      console.error('Error fetching materials:', error);
      setIsLoading(false); // Set loading state to false if there's an error
    });
  }

  const findRawMatObjects = (arr1: any[], arr2: any[]): { matchingObjects: any[], remainingObjects: any[] } => {
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Material Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {isLoading ? ( // Show loading indicator if data is loading
          <div>Loading...</div>
        ) : (
          <>
            <TableContainer key={1} title='Raw Materials' material={rawMaterial} />
            <TableContainer key={2} title='Shop Materials' material={materials} /> 
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
