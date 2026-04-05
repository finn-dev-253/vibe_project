import { Injectable } from '@nestjs/common';

export interface Asset {
  id: string;
  name: string;
  value: number;
  ownerId: string;
}

// In-memory store for demo purposes
const ASSETS: Asset[] = [
  { id: '1', name: 'Vehicle Fleet A', value: 150000, ownerId: 'customer-seed' },
  { id: '2', name: 'Storage Unit B', value: 20000, ownerId: 'customer-seed' },
];

@Injectable()
export class AssetsService {
  getMyAssets(userId: string): Asset[] {
    return ASSETS.filter((a) => a.ownerId === userId);
  }

  updateMyAsset(userId: string, assetId: string, data: Partial<Pick<Asset, 'name' | 'value'>>) {
    const asset = ASSETS.find((a) => a.id === assetId && a.ownerId === userId);
    if (!asset) {
      return null;
    }
    if (data.name !== undefined) asset.name = data.name;
    if (data.value !== undefined) asset.value = data.value;
    return asset;
  }

  getAllAssets(): Asset[] {
    return ASSETS;
  }
}
