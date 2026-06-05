const cases = [
  "Room A1 — 4-Bed Shared — Kogi Hall",
  "A1 — 4-Bed Shared — Kogi Hall",
  "Room A1 - 4-Bed Shared - Kogi Hall",
  "A1 - 4-Bed Shared - Kogi Hall",
  "Pending allocation",
  "4-Bed Shared"
];

cases.forEach(room_type => {
  const firstPart = room_type.split(/[-—]/)[0].trim();
  const roomNumber = firstPart.replace(/^Room\s+/i, "");
  console.log(`Input: ${room_type} => RoomNumber: ${roomNumber}`);
});
