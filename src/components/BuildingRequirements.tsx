import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonChip,
  IonBadge,
  IonList,
  IonToast,
  IonAlert,
  IonFab,
  IonFabButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonAccordion,
  IonAccordionGroup
} from '@ionic/react';
import {
  add,
  saveOutline,
  trashOutline,
  closeOutline,
  buildOutline,
  businessOutline,
  homeOutline,
  leafOutline,
  planetOutline,
  diamondOutline,
  checkmarkCircleOutline,
  timeOutline,
  warningOutline
} from 'ionicons/icons';
import { MaterialSelector } from './MaterialSelector';
import './BuildingRequirements.css';

// Type definitions (moved inline since ../types doesn't exist)
enum BuildingType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  SERVICE = 'SERVICE',
  SPECIALIZATION = 'SPECIALIZATION',
  LANDMARK = 'LANDMARK'
}

enum BuildingStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

enum MaterialCategory {
  RAW = 'RAW',
  PROCESSED = 'PROCESSED',
  MANUFACTURED = 'MANUFACTURED'
}

interface MaterialRequirement {
  materialName: string;
  quantity: number;
  category?: MaterialCategory;
  tier?: number;
}

interface BuildingRequirement {
  id?: number;
  buildingName: string;
  buildingType: BuildingType;
  quantity: number;
  materialRequirements: MaterialRequirement[];
  priority: Priority;
  status: BuildingStatus;
  notes?: string;
  dateAdded?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MaterialData {
  id: number;
  mat_name: string;
  haveQty: number;
  requiredQty: number;
}

interface ResourceAnalysis {
  totalMaterials: number;
  availableMaterials: number;
  missingMaterials: number;
  completionPercentage: number;
  estimatedProductionTime?: number;
}

// Mock service classes (since ../services don't exist)
class DatabaseService {
  static getInstance() {
    return new DatabaseService();
  }
  
  async getAllBuildingRequirements(): Promise<BuildingRequirement[]> {
    // Mock implementation - would need real Dexie integration
    return [];
  }
  
  async saveBuildingRequirement(req: BuildingRequirement): Promise<void> {
    console.log('Save building requirement:', req);
  }
  
  async addBuildingRequirement(req: BuildingRequirement): Promise<void> {
    console.log('Add building requirement:', req);
  }
  
  async updateBuildingRequirement(id: number, updates: Partial<BuildingRequirement>): Promise<void> {
    console.log('Update building requirement:', id, updates);
  }
  
  async deleteBuildingRequirement(id: number): Promise<void> {
    console.log('Delete building requirement:', id);
  }
}

class GameDataService {
  static getInstance() {
    return new GameDataService();
  }
}

class ProductionCalculationService {
  static getInstance() {
    return new ProductionCalculationService();
  }
  
  async calculateResourceAnalysis(
    requirements: MaterialRequirement[], 
    quantity: number
  ): Promise<ResourceAnalysis> {
    // Mock implementation
    return {
      totalMaterials: requirements.length,
      availableMaterials: 0,
      missingMaterials: requirements.length,
      completionPercentage: 0
    };
  }
}

interface BuildingRequirementsProps {
  onRequirementsUpdate?: (requirements: BuildingRequirement[]) => void;
}

interface MaterialInfo {
  img: string;
  material_name: string;
  category?: MaterialCategory;
  tier?: number;
}

const BuildingRequirements: React.FC<BuildingRequirementsProps> = ({ onRequirementsUpdate }) => {
  const [requirements, setRequirements] = useState<BuildingRequirement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<BuildingStatus | 'ALL'>('ALL');
  const [analysisData, setAnalysisData] = useState<{ [key: number]: ResourceAnalysis }>({});
  const [materials, setMaterials] = useState<MaterialInfo[]>([]);
  const [selectedMaterialQuantity, setSelectedMaterialQuantity] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState<Partial<BuildingRequirement>>({
    buildingName: '',
    buildingType: BuildingType.RESIDENTIAL,
    quantity: 1,
    materialRequirements: [],
    priority: Priority.MEDIUM,
    status: BuildingStatus.PLANNED
  });

  const [dbService] = useState(() => DatabaseService.getInstance());
  const [gameDataService] = useState(() => GameDataService.getInstance());
  const [calculationService] = useState(() => ProductionCalculationService.getInstance());

  const buildingTypeIcons = {
    [BuildingType.RESIDENTIAL]: homeOutline,
    [BuildingType.COMMERCIAL]: businessOutline,
    [BuildingType.INDUSTRIAL]: buildOutline,
    [BuildingType.SERVICE]: diamondOutline,
    [BuildingType.SPECIALIZATION]: planetOutline,
    [BuildingType.LANDMARK]: leafOutline
  };

  const statusColors = {
    [BuildingStatus.PLANNED]: 'medium',
    [BuildingStatus.IN_PROGRESS]: 'warning',
    [BuildingStatus.COMPLETED]: 'success',
    [BuildingStatus.ON_HOLD]: 'danger'
  };

  const priorityColors = {
    [Priority.LOW]: 'medium',
    [Priority.MEDIUM]: 'primary',
    [Priority.HIGH]: 'warning',
    [Priority.URGENT]: 'danger'
  };

  useEffect(() => {
    loadRequirements();
    loadMaterials();
  }, []);

  useEffect(() => {
    calculateResourceAnalysis();
  }, [requirements]);

  const loadRequirements = async () => {
    try {
      setIsLoading(true);
      const data = await dbService.getAllBuildingRequirements();
      setRequirements(data);
      onRequirementsUpdate?.(data);
    } catch (error) {
      console.error('Error loading requirements:', error);
      showToastMessage('Failed to load building requirements');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await fetch('/assets/data/materials.json');
      if (!response.ok) throw new Error('Failed to load materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  const calculateResourceAnalysis = async () => {
    try {
      const analysis: { [key: number]: ResourceAnalysis } = {};
      
      for (const requirement of requirements) {
        if (requirement.id && requirement.materialRequirements.length > 0) {
          const resourceAnalysis = await calculationService.calculateResourceAnalysis(
            requirement.materialRequirements,
            requirement.quantity || 1
          );
          analysis[requirement.id] = resourceAnalysis;
        }
      }
      
      setAnalysisData(analysis);
    } catch (error) {
      console.error('Error calculating resource analysis:', error);
    }
  };

  const handleAddMaterialRequirement = (materialName: string) => {
    // Show a quantity prompt or use a state-based quantity input
    const quantity = selectedMaterialQuantity;
    
    const existingReq = formData.materialRequirements?.find((req: MaterialRequirement) => req.materialName === materialName);
    const material = materials.find(m => m.material_name === materialName);
    
    if (existingReq) {
      // Update existing requirement
      setFormData(prev => ({
        ...prev,
        materialRequirements: (prev.materialRequirements as any)?.map((req: any) =>
          req.materialName === materialName
            ? { ...req, quantity: req.quantity + quantity }
            : req
        ) || []
      }));
    } else {
      // Add new requirement
      const newReq: MaterialRequirement = {
        materialName,
        quantity,
        category: material?.category as any,
        tier: material?.tier
      };
      
      setFormData(prev => ({
        ...prev,
        materialRequirements: [...((prev.materialRequirements as any) || []), newReq]
      }));
    }
    
    setSelectedMaterialQuantity(1); // Reset quantity input
  };

  const handleRemoveMaterialRequirement = (materialName: string) => {
    setFormData(prev => ({
      ...prev,
      materialRequirements: prev.materialRequirements?.filter(req => req.materialName !== materialName) || []
    }));
  };

  const handleSaveRequirement = async () => {
    try {
      if (!formData.buildingName || !formData.materialRequirements?.length) {
        showToastMessage('Please fill in building name and add at least one material requirement');
        return;
      }

      const requirement: BuildingRequirement = {
        buildingName: formData.buildingName,
        buildingType: formData.buildingType!,
        quantity: formData.quantity || 1,
        materialRequirements: formData.materialRequirements,
        priority: formData.priority!,
        status: formData.status!,
        dateAdded: new Date(),
        notes: formData.notes
      };

      await dbService.addBuildingRequirement(requirement);
      await loadRequirements();
      
      // Reset form
      setFormData({
        buildingName: '',
        buildingType: BuildingType.RESIDENTIAL,
        quantity: 1,
        materialRequirements: [],
        priority: Priority.MEDIUM,
        status: BuildingStatus.PLANNED
      });
      
      setIsModalOpen(false);
      showToastMessage('Building requirement added successfully');
    } catch (error) {
      console.error('Error saving requirement:', error);
      showToastMessage('Failed to save building requirement');
    }
  };

  const handleDeleteRequirement = async () => {
    if (deletingId) {
      try {
        await dbService.deleteBuildingRequirement(deletingId);
        await loadRequirements();
        showToastMessage('Building requirement deleted');
      } catch (error) {
        console.error('Error deleting requirement:', error);
        showToastMessage('Failed to delete building requirement');
      }
    }
    setShowAlert(false);
    setDeletingId(null);
  };

  const handleUpdateStatus = async (id: number, status: BuildingStatus) => {
    try {
      await dbService.updateBuildingRequirement(id, { status });
      await loadRequirements();
      showToastMessage('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      showToastMessage('Failed to update status');
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleResetForm = () => {
    setFormData({
      buildingName: '',
      buildingType: BuildingType.RESIDENTIAL,
      quantity: 1,
      materialRequirements: [],
      priority: Priority.MEDIUM,
      status: BuildingStatus.PLANNED
    });
    setSelectedMaterialQuantity(1);
    showToastMessage('Form cleared');
  };

  const filteredRequirements = requirements.filter(req => 
    selectedFilter === 'ALL' || req.status === selectedFilter
  );

  const getStatusCount = (status: BuildingStatus) => {
    return requirements.filter(req => req.status === status).length;
  };

  const getTotalMaterialRequirements = () => {
    const totals: { [key: string]: number } = {};
    
    requirements.forEach(req => {
      req.materialRequirements.forEach(matReq => {
        const totalNeeded = matReq.quantity * (req.quantity || 1);
        totals[matReq.materialName] = (totals[matReq.materialName] || 0) + totalNeeded;
      });
    });
    
    return totals;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <IonSpinner name="crescent" />
        <p>Loading building requirements...</p>
      </div>
    );
  }

  return (
    <div className="building-requirements">
      {/* Summary Cards */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Requirements Overview</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <div className="stat-item">
                  <h3>{requirements.length}</h3>
                  <p>Total Buildings</p>
                </div>
              </IonCol>
              <IonCol size="6">
                <div className="stat-item">
                  <h3>{Object.keys(getTotalMaterialRequirements()).length}</h3>
                  <p>Material Types</p>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>

      {/* Status Filter */}
      <IonCard>
        <IonCardContent>
          <IonSegment
            value={selectedFilter}
            onIonChange={(e) => setSelectedFilter(e.detail.value as BuildingStatus | 'ALL')}
            scrollable
          >
            <IonSegmentButton value="ALL">
              <IonLabel>All ({requirements.length})</IonLabel>
            </IonSegmentButton>
            {Object.values(BuildingStatus).map(status => (
              <IonSegmentButton key={status} value={status}>
                <IonLabel>{status} ({getStatusCount(status)})</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonCardContent>
      </IonCard>

      {/* Requirements List */}
      <IonAccordionGroup>
        {filteredRequirements.map((requirement) => (
          <IonAccordion key={requirement.id} value={`req-${requirement.id}`}>
            <IonItem slot="header" color="light">
              <IonIcon 
                icon={buildingTypeIcons[requirement.buildingType]} 
                slot="start" 
                color="primary"
              />
              <IonLabel>
                <h2>{requirement.buildingName}</h2>
                <p>Quantity: {requirement.quantity} | {requirement.buildingType}</p>
              </IonLabel>
              <IonChip 
                color={statusColors[requirement.status] as any}
                slot="end"
              >
                {requirement.status}
              </IonChip>
              <IonBadge 
                color={priorityColors[requirement.priority] as any}
                slot="end"
                style={{ marginLeft: '8px' }}
              >
                {requirement.priority}
              </IonBadge>
            </IonItem>
            
            <div className="accordion-content" slot="content">
              {/* Material Requirements */}
              <div className="requirements-section">
                <h4>Material Requirements</h4>
                <div className="materials-grid">
                  {requirement.materialRequirements.map((matReq) => (
                    <div key={matReq.materialName} className="material-requirement-item">
                      <img
                        src={`/assets/images/${matReq.materialName}.png`}
                        alt={matReq.materialName}
                        className="material-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="material-details">
                        <strong>{matReq.materialName}</strong>
                        <p>{matReq.quantity} × {requirement.quantity} = {matReq.quantity * (requirement.quantity || 1)} total</p>
                        <IonChip color="medium">
                          {matReq.category}
                        </IonChip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Analysis */}
              {requirement.id && analysisData[requirement.id] && (
                <div className="analysis-section">
                  <h4>Resource Analysis</h4>
                  <div className="analysis-stats">
                    <div className="analysis-stat">
                      <IonIcon icon={timeOutline} color="primary" />
                      <div>
                        <strong>Est. Production Time</strong>
                        <p>{Math.round((analysisData[requirement.id].estimatedProductionTime || 0) / 60)} hours</p>
                      </div>
                    </div>
                    <div className="analysis-stat">
                      <IonIcon icon={warningOutline} color="warning" />
                      <div>
                        <strong>Missing Materials</strong>
                        <p>{analysisData[requirement.id].missingMaterials} items</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="requirement-actions">
                <IonSelect
                  value={requirement.status}
                  placeholder="Update Status"
                  onIonChange={(e) => handleUpdateStatus(requirement.id!, e.detail.value)}
                  interface="popover"
                >
                  {Object.values(BuildingStatus).map(status => (
                    <IonSelectOption key={status} value={status}>
                      {status}
                    </IonSelectOption>
                  ))}
                </IonSelect>
                
                <IonButton
                  fill="outline"
                  color="danger"
                  onClick={() => {
                    setDeletingId(requirement.id!);
                    setShowAlert(true);
                  }}
                >
                  <IonIcon icon={trashOutline} slot="start" />
                  Delete
                </IonButton>
              </div>

              {requirement.notes && (
                <div className="notes-section">
                  <h4>Notes</h4>
                  <p>{requirement.notes}</p>
                </div>
              )}
            </div>
          </IonAccordion>
        ))}
      </IonAccordionGroup>

      {filteredRequirements.length === 0 && (
        <IonCard>
          <IonCardContent>
            <div className="empty-state">
              <IonIcon icon={buildOutline} size="large" color="medium" />
              <h3>No building requirements</h3>
              <p>Add your first building requirement to get started</p>
              <IonButton 
                fill="solid" 
                onClick={() => setIsModalOpen(true)}
              >
                Add Building Requirement
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      )}

      {/* Add Button */}
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setIsModalOpen(true)}>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>

      {/* Add/Edit Modal */}
      <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Add Building Requirement</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsModalOpen(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="modal-content">
            <IonItem>
              <IonLabel position="stacked">Building Name</IonLabel>
              <IonInput
                value={formData.buildingName}
                onIonInput={(e) => setFormData(prev => ({ ...prev, buildingName: e.detail.value! }))}
                placeholder="Enter building name"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Building Type</IonLabel>
              <IonSelect
                value={formData.buildingType}
                onIonChange={(e) => setFormData(prev => ({ ...prev, buildingType: e.detail.value }))}
              >
                {Object.values(BuildingType).map(type => (
                  <IonSelectOption key={type} value={type}>
                    {type}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Quantity</IonLabel>
              <IonInput
                type="number"
                value={formData.quantity}
                onIonInput={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.detail.value!) || 1 }))}
                min="1"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Priority</IonLabel>
              <IonSelect
                value={formData.priority}
                onIonChange={(e) => setFormData(prev => ({ ...prev, priority: e.detail.value }))}
              >
                {Object.values(Priority).map(priority => (
                  <IonSelectOption key={priority} value={priority}>
                    {priority}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Notes (Optional)</IonLabel>
              <IonInput
                value={formData.notes}
                onIonInput={(e) => setFormData(prev => ({ ...prev, notes: e.detail.value! }))}
                placeholder="Additional notes"
              />
            </IonItem>

            {/* Material Requirements */}
            <div className="material-requirements-section">
              <h3>Material Requirements</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <MaterialSelector
                  materials={materials}
                  selectedMaterial=""
                  onSelectionChange={handleAddMaterialRequirement}
                  placeholder="Add materials needed for this building"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <IonItem>
                  <IonLabel position="stacked">Quantity</IonLabel>
                  <IonInput
                    type="number"
                    value={selectedMaterialQuantity}
                    onIonInput={(e) => setSelectedMaterialQuantity(parseInt(e.detail.value!) || 1)}
                    min="1"
                  />
                </IonItem>
              </div>
              
              {formData.materialRequirements && formData.materialRequirements.length > 0 && (
                <div className="selected-materials">
                  <h4>Selected Materials</h4>
                  {(formData.materialRequirements as any).map((req: any) => (
                    <IonItem key={req.materialName}>
                      <img
                        src={`/assets/images/${req.materialName}.png`}
                        alt={req.materialName}
                        className="material-image-small"
                        slot="start"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <IonLabel>
                        <h3>{req.materialName}</h3>
                        <p>Quantity: {req.quantity}</p>
                      </IonLabel>
                      <IonButton
                        fill="clear"
                        color="danger"
                        slot="end"
                        onClick={() => handleRemoveMaterialRequirement(req.materialName)}
                      >
                        <IonIcon icon={trashOutline} />
                      </IonButton>
                    </IonItem>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <IonButton
                expand="block"
                onClick={handleSaveRequirement}
                disabled={!formData.buildingName || !formData.materialRequirements?.length}
                color="success"
              >
                <IonIcon icon={saveOutline} slot="start" />
                Save Building Requirement
              </IonButton>
              <IonButton
                expand="block"
                fill="outline"
                color="warning"
                onClick={handleResetForm}
              >
                <IonIcon icon={closeOutline} slot="start" />
                Clear/Reset Form
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Delete Confirmation Alert */}
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Delete Building Requirement"
        message="Are you sure you want to delete this building requirement? This action cannot be undone."
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: handleDeleteRequirement
          }
        ]}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
      />
    </div>
  );
};

export default BuildingRequirements;
