/**
 * hostel.ts — Single source of truth for all hostel data.
 *
 * Rules:
 *  - 4 blocks, each gender-restricted
 *  - 16 rooms per block (8 quad + 4 double + 4 single), generated programmatically
 *  - All filtering across the app must come from this file
 *  - Structured for easy Supabase migration later
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Gender     = 'male' | 'female';
export type RoomType   = 'quad' | 'double' | 'single';
export type RoomStatus = 'available' | 'limited' | 'full';

export interface Block {
  id: string;          // 'A' | 'B' | 'C' | 'D'
  name: string;        // e.g. "Kogi Hall"
  letter: string;      // e.g. "A"
  gender: Gender;
  description: string;
  totalRooms: number;
}

export interface Room {
  id: string;          // e.g. "A1"
  name: string;        // e.g. "Room A1"
  blockId: string;     // matches Block.id
  blockName: string;   // e.g. "Kogi Hall"
  type: RoomType;
  label: string;       // e.g. "4-Bed Shared"
  beds: number;
  price: number;
  status: RoomStatus;
  gender: Gender;      // inherited from block
  image: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const ROOM_TYPE_CONFIG: Record<RoomType, { label: string; beds: number; price: number }> = {
  quad:   { label: '4-Bed Shared', beds: 4, price: 45_000 },
  double: { label: 'Double',       beds: 2, price: 70_000 },
  single: { label: 'Single',       beds: 1, price: 95_000 },
};

// Room images per type (stable, not random)
const ROOM_IMAGES: Record<RoomType, string[]> = {
  quad: [
    new URL('../assets/4beds.jpg', import.meta.url).href,
  ],
  double: [
    new URL('../assets/2bed.jpg', import.meta.url).href,
  ],
  single: [
    new URL('../assets/1bed.jpg', import.meta.url).href,
  ],
};

/**
 * Per-block room layout: 16 rooms total.
 * Index 0–7  → quad   (₦45k, 4-bed shared)
 * Index 8–11 → double (₦70k)
 * Index 12–15 → single (₦95k)
 */
const ROOM_LAYOUT: RoomType[] = [
  'quad', 'quad', 'quad', 'quad', 'quad', 'quad', 'quad', 'quad', // 1–8
  'double', 'double', 'double', 'double',                          // 9–12
  'single', 'single', 'single', 'single',                          // 13–16
];

/**
 * Deterministic status assignment (no Math.random — stable across renders).
 * Pattern repeats across positions.
 */
const STATUS_PATTERN: RoomStatus[] = [
  'available', 'available', 'available', 'available',
  'limited',   'available', 'available', 'full',       // quad (8)
  'available', 'available', 'limited',   'available',  // double (4)
  'available', 'limited',   'available', 'available',  // single (4)
];

// ─── Blocks ──────────────────────────────────────────────────────────────────

export const blocks: Block[] = [
  {
    id: 'A',
    name: 'Kogi Hall',
    letter: 'A',
    gender: 'male',
    description: 'A well-maintained male hostel block with 24/7 security, reliable power, and easy access to the main campus.',
    totalRooms: ROOM_LAYOUT.length,
  },
  {
    id: 'B',
    name: 'Confluence Hall',
    letter: 'B',
    gender: 'female',
    description: 'A secure and comfortable female hostel block featuring modern facilities and a vibrant community environment.',
    totalRooms: ROOM_LAYOUT.length,
  },
  {
    id: 'C',
    name: 'Osara Hall',
    letter: 'C',
    gender: 'male',
    description: 'A spacious male hostel block situated close to the faculty buildings, ideal for focused academic life.',
    totalRooms: ROOM_LAYOUT.length,
  },
  {
    id: 'D',
    name: 'Okene Hall',
    letter: 'D',
    gender: 'female',
    description: 'A premium female hostel block offering a calm, study-friendly atmosphere with superior room finishes.',
    totalRooms: ROOM_LAYOUT.length,
  },
];

// ─── Room generator ───────────────────────────────────────────────────────────

function generateRoomsForBlock(block: Block): Room[] {
  return ROOM_LAYOUT.map((type, index) => {
    const roomNumber = index + 1;
    const id         = `${block.letter}${roomNumber}`;
    const config     = ROOM_TYPE_CONFIG[type];
    const imgArr     = ROOM_IMAGES[type];
    const image      = imgArr[index % imgArr.length];

    return {
      id,
      name:      `Room ${id}`,
      blockId:   block.id,
      blockName: block.name,
      type,
      label:     config.label,
      beds:      config.beds,
      price:     config.price,
      status:    STATUS_PATTERN[index],
      gender:    block.gender,
      image,
    };
  });
}

// ─── Rooms (80 total: 4 blocks × 16 rooms) ───────────────────────────────────

export const rooms: Room[] = blocks.flatMap(generateRoomsForBlock);

// ─── Helper selectors (use these in components, not inline filtering) ─────────

/** Rooms belonging to a specific block */
export function getRoomsByBlock(blockId: string): Room[] {
  return rooms.filter((r) => r.blockId === blockId);
}

/** Blocks visible to a given gender (or all if admin) */
export function getBlocksByGender(gender: Gender): Block[] {
  return blocks.filter((b) => b.gender === gender);
}

/** Look up a single block */
export function getBlockById(blockId: string): Block | undefined {
  return blocks.find((b) => b.id === blockId);
}

/** Look up a single room */
export function getRoomById(roomId: string): Room | undefined {
  return rooms.find((r) => r.id === roomId);
}

/** Available + limited rooms for a given gender (for Apply dropdown) */
export function getApplicableRooms(gender: Gender): Room[] {
  return rooms.filter((r) => r.gender === gender && r.status !== 'full');
}
