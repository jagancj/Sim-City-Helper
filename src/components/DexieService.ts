import Dexie from 'dexie';

interface Material {
  id?: number;
  mat_name: string;
  haveQty: number;
  requiredQty: number;
}

interface Building {
  id?: number;
  [key: string]: string | number | undefined;
}

class DexieDB extends Dexie {
  materials: Dexie.Table<Material, number>;
  buildings: Dexie.Table<Building, number>;

  constructor() {
    super('SimDatabase');
    this.version(1).stores({
      materials: '++id, mat_name, haveQty, requiredQty',
      buildings: '++id, &name' // Defining '*' allows for dynamic properties
    });

    this.materials = this.table('materials');
    this.buildings = this.table('buildings');
  }
}

class DexieService {
  private db: DexieDB;

  constructor() {
    this.db = new DexieDB();
  }

  async addMaterial(mat_name: string, haveQty: number, requiredQty: number): Promise<number> {
    const existingMaterial = await this.db.materials.where('mat_name').equals(mat_name).first();

    if (existingMaterial) {
      const updatedHaveQty = existingMaterial.haveQty + haveQty;
      const updatedRequiredQty = existingMaterial.requiredQty + requiredQty;
      const netUpdatedHaveQty = (updatedHaveQty >= 0) ? updatedHaveQty : 0;
      const netUpdatedRequiredQty = (updatedRequiredQty >= 0) ? updatedRequiredQty : 0;
      await this.db.materials.update(existingMaterial.id!, { haveQty: netUpdatedHaveQty, requiredQty: netUpdatedRequiredQty });
      return existingMaterial.id!;
    } else {
      return await this.db.materials.add({ mat_name, haveQty, requiredQty });
    }
  }

  async addBuilding(building: Building): Promise<number> {
    try {
      const id = await this.db.buildings.add(building);
      return id;
    } catch (error) {
      console.error('Error adding building:', error);
      throw error;
    }
  }

  async getBuildings(): Promise<Building[]> {
    return await this.db.buildings.toArray();
  }

  async getMaterials(): Promise<Material[]> {
    return await this.db.materials.toArray();
  }

  async updateMaterial(id: number, newData: Partial<Material>): Promise<void> {
    await this.db.materials.update(id, newData);
  }

  async updateBuilding(id: number, newData: Partial<Building>): Promise<void> {
    await this.db.buildings.update(id, newData);
  }

  async deleteMaterial(id: number): Promise<void> {
    await this.db.materials.delete(id);
  }

  async deleteBuilding(id: number): Promise<void> {
    await this.db.buildings.delete(id);
  }
}

export default DexieService;
