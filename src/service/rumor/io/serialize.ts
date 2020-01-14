import { TileChangeEntry } from '@/types/map';

const MAP_BYTES = 2,
  FIELDS_TO_SERIALIZE = 5;

export function serializeChanges(changes: TileChangeEntry[]) {
  const size = changes.length * FIELDS_TO_SERIALIZE,
    buffer = new ArrayBuffer(size * MAP_BYTES),
    arr = new Uint16Array(buffer, 0, size);

  let pos = 0;

  for (const change of changes) {
    arr[pos++] = change.l;
    arr[pos++] = change.x;
    arr[pos++] = change.y;
    arr[pos++] = change.t;
    arr[pos++] = change.v;
  }

  return buffer;
}

export function deserializeChanges(buffer: ArrayBuffer): TileChangeEntry[] {
  const arr = new Uint16Array(buffer, 0, buffer.byteLength / 2),
    changes: TileChangeEntry[] = [];

  let pos = 0, i = 0;

  while (pos < arr.length) {
    const change: any = {}

    change.l = arr[pos++];
    change.x = arr[pos++];
    change.y = arr[pos++];
    change.t = arr[pos++];
    change.v = arr[pos++];

    changes.push(change);
  }

  return changes;
}
