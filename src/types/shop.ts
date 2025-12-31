export interface ShopItem {
    id: string;
    name: string;
    price: number;
    category: 'CLOTHES' | 'FURNITURE' | 'DECO';
    emoji: string;
}
