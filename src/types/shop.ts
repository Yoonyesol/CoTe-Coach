export interface ShopItem {
    id: string;
    name: string;
    price: number;
    category: 'ACCESSORY' | 'CLOTHES' | 'FURNITURE' | 'DECO' | 'WALLPAPER';
    emoji: string;
}
