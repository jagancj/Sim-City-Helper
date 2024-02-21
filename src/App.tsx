import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { add, ellipse, gameController, home, square, storefront, triangle } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { useState } from 'react';

setupIonicReact();

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (<IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Tab1 isActive={activeTab === 'home'} tab='home'/>
          </Route>
          <Route exact path="/build">
            <Tab2 />
          </Route>
          <Route path="/store">
            <Tab3 />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home" onClick={() => handleTabChange('home')}>
            <IonIcon aria-hidden="true" icon={gameController} />
            <IonLabel>Dashboard</IonLabel>
          </IonTabButton>
          <IonTabButton tab="build" href="/build" onClick={() => handleTabChange('build')}>
            <IonIcon aria-hidden="true" icon={home} />
            <IonLabel>Building</IonLabel>
          </IonTabButton>
          <IonTabButton tab="store" href="/store" onClick={() => handleTabChange('store')}>
            <IonIcon aria-hidden="true" icon={storefront} />
            <IonLabel>Storage</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);
};

export default App;
