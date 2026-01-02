import React from 'react';

export type ItemSlot = 'head' | 'clothes' | 'background' | 'ground' | 'effect' | 'wallpaper';

export interface AvatarAsset {
    id: string;
    name: string;
    slot: ItemSlot;
    iconPath?: string;
    svgIcon?: React.ComponentType;
}
