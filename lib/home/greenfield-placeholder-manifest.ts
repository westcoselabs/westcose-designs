export type GreenfieldAssetFit = "contain" | "cover";

export type GreenfieldAssetSlot = {
  id:
    | "brand-board"
    | "district-mark"
    | "school-system"
    | "type-color"
    | "stationery"
    | "rollout";
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  futurePath: string;
  fit: GreenfieldAssetFit;
};

export const GREENFIELD_ASSET_SLOTS = [
  {
    id: "brand-board",
    label: "Primary brand board",
    width: 1600,
    height: 2000,
    aspectRatio: "4:5",
    futurePath: "/experience/greenfield/greenfield-brand-board.webp",
    fit: "contain",
  },
  {
    id: "district-mark",
    label: "District mark construction",
    width: 1600,
    height: 1600,
    aspectRatio: "1:1",
    futurePath: "/experience/greenfield/greenfield-district-mark.svg",
    fit: "contain",
  },
  {
    id: "school-system",
    label: "School identity system",
    width: 2400,
    height: 1200,
    aspectRatio: "2:1",
    futurePath: "/experience/greenfield/greenfield-school-system.webp",
    fit: "contain",
  },
  {
    id: "type-color",
    label: "Typography and color specimen",
    width: 2400,
    height: 1350,
    aspectRatio: "16:9",
    futurePath: "/experience/greenfield/greenfield-type-color.webp",
    fit: "contain",
  },
  {
    id: "stationery",
    label: "Stationery system",
    width: 2400,
    height: 1600,
    aspectRatio: "3:2",
    futurePath: "/experience/greenfield/greenfield-stationery.webp",
    fit: "cover",
  },
  {
    id: "rollout",
    label: "Rollout and application view",
    width: 2400,
    height: 1350,
    aspectRatio: "16:9",
    futurePath: "/experience/greenfield/greenfield-rollout.webp",
    fit: "cover",
  },
] as const satisfies readonly GreenfieldAssetSlot[];

export const GREENFIELD_BRAND_BOARD_SLOT = GREENFIELD_ASSET_SLOTS[0];

export function formatGreenfieldSlotDimensions(
  slot: Pick<GreenfieldAssetSlot, "height" | "width">,
) {
  return `${slot.width} x ${slot.height} px`;
}
