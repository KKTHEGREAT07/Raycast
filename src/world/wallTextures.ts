export const WALL_TEXTURE_IDS = {
    normal: 1,
    sellingBooth: 2,
    itemStation: 3,
    livesTip: 4,
    ammoTip: 5,
    chaseTip: 6,
    sneakTip: 7,
    stationTip: 8,
    dangerTip: 9,
} as const;

export const WALL_TEXTURE_MESSAGES: Partial<Record<number, string>> = {
    [WALL_TEXTURE_IDS.livesTip]: "You have three lives. You can buy more at the selling booth.",
    [WALL_TEXTURE_IDS.ammoTip]: "Use ammo to stun the enemy.",
    [WALL_TEXTURE_IDS.chaseTip]: "He will chase you through the maze. Keep moving.",
    [WALL_TEXTURE_IDS.sneakTip]: "Try to sneak so you do not get caught.",
    [WALL_TEXTURE_IDS.stationTip]: "Station one is here. Collect one item at a time.",
    [WALL_TEXTURE_IDS.dangerTip]: "Danger zone ahead. Be careful. He hears everything.",
};
