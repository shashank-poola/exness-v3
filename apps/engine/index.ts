import { enginePuller } from '@exness-v3/redis/streams';
import { processMessage } from './src/handler';
import { prices, users } from './memoryDb';
import { mongodb } from './src/utils/dbClient';

const STREAM_KEY = 'stream:engine';
const GROUP_NAME = 'group';
const CONSUMER_NAME = 'consumer-1';
const SNAPSHOT_INTERVAL = 15_000; // 10s

let lastSnapshotAt: number;
let lastItemReadId = '';

async function restoreSnapshot() {
  const collection = mongodb.collection('engine-snapshots');
  const result = await collection.findOne({ id: 'dump' });

  if (result) {
    Object.assign(prices, result.data.prices);
    Object.assign(users, result.data.users);
    lastSnapshotAt = result.data.lastSnapshotAt;
    lastItemReadId = result.data.lastItemReadId;
    console.log('Restored snapshot from DB');
  } else {
    console.log('No snapshot found, starting fresh');
    lastSnapshotAt = Date.now();
  }
}

async function saveSnapshot() {
  const now = Date.now();
  if (now - lastSnapshotAt < SNAPSHOT_INTERVAL) return;

  const collection = mongodb.collection('engine-snapshots');
  const snapshot = {
    id: 'dump',
    data: {
      prices,
      users,
      lastSnapshotAt: now,
      lastItemReadId,
    },
  };

  await collection.updateOne(
    { id: 'dump' },
    { $set: snapshot },
    { upsert: true }
  );
  lastSnapshotAt = now;
}

async function startEngine() {
  await enginePuller.connect();

  try {
    await enginePuller.xGroupCreate(STREAM_KEY, GROUP_NAME, '0', {
      MKSTREAM: true,
    });
  } catch (err) {
    console.log('Consumer group exists');
  }

  await restoreSnapshot();

  const groups = await enginePuller.xInfoGroups(STREAM_KEY);
  const lastDeliveredId = groups[0]?.['last-delivered-id']?.toString();

  if (
    lastDeliveredId &&
    lastItemReadId !== '' &&
    lastItemReadId !== lastDeliveredId
  ) {
    await replay(lastItemReadId, lastDeliveredId);
  }

  while (true) {
    if (lastItemReadId) {
      await enginePuller.xAck(STREAM_KEY, GROUP_NAME, lastItemReadId);
    }

    const response = (await enginePuller.xReadGroup(
      GROUP_NAME,
      CONSUMER_NAME,
      { key: STREAM_KEY, id: '>' },
      { BLOCK: 0 }
    )) as any[];

    if (response) {
      const msg = response[0].messages[0];
      lastItemReadId = msg.id;

      await processMessage(msg);
      await saveSnapshot();
    }
  }
}

async function replay(fromId: string, toId: string) {
  const entries = await enginePuller.xRange(STREAM_KEY, fromId, toId);
  const missed = entries.slice(1);

  for (const entry of missed) {
    try {
      const msg = entry.message;
      // to be fixed: dont' send acknolwedgmenet here
      // await processMessage(msg);

      lastItemReadId = entry.id;
    } catch (err) {
      console.error('Replay failed', err);
    }
  }
}

startEngine();