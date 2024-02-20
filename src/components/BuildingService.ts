import Dexie from 'dexie';

interface Building {
  id?: number;
  buildNo: number;
  name: string ;
  qty: number;
}

class DexieDB extends Dexie {
  buildings: Dexie.Table<Building, number>;

  constructor() {
    super('BuildingDatabase');
    this.version(1).stores({
      buildings: '++id, buildNo, name, qty' // Defining '*' allows for dynamic properties
    });

    this.buildings = this.table('buildings');
  }
}

class BuildingService {
  private db: DexieDB;

  constructor() {
    this.db = new DexieDB();
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

  async updateBuilding(id: number, newData: Partial<Building>): Promise<void> {
    await this.db.buildings.update(id, newData);
  }

  async deleteBuilding(id: number): Promise<void> {
    await this.db.buildings.delete(id);
  }
}

export default BuildingService;
