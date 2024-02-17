import { IonContent, IonHeader, IonImg, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Tab1.css';
import { useEffect, useState } from 'react';
import Material from '../components/DexieService';
import DexieService  from '../components/DexieService';

const Tab1: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    const dexieService = new DexieService();

    dexieService.getMaterials().then((materials) => {
      console.log(materials);
      setMaterials(materials);
    });
  }, []);
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Material Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <table className="material-table">
      <thead>
        <tr>
          <th>Material</th>
          <th>Have</th>
          <th>Required</th>
          <th>Need</th>
        </tr>
      </thead>
      <tbody>
        {materials.map((material) => (
          <tr key={material.id}>
            <td className='text-style'>
            <img
      src={`src/assets/images/${material.mat_name}.png`}
      alt={material.mat_name}
    />
    <span>{material.mat_name}</span></td>
            <td>{material.haveQty}</td>
            <td>{material.requiredQty}</td>
            <td>{material.requiredQty-material.haveQty}</td>
          </tr>
        ))}
      </tbody>
    </table>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
