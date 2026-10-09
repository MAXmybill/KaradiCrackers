import fs from 'fs';
import path from 'path';

const dataStorePath = path.join(process.cwd(), 'data-store.json');
const seedDataPath = path.join(process.cwd(), 'src', 'lib', 'seedData.ts');

if (fs.existsSync(dataStorePath)) {
  const store = JSON.parse(fs.readFileSync(dataStorePath, 'utf8'));
  let counter = 1;
  const updatedCrackers = store.crackers.map((c) => {
    const code = `KC${String(counter++).padStart(3, '0')}`;
    return {
      ...c,
      itemCode: code,
    };
  });

  store.crackers = updatedCrackers;
  fs.writeFileSync(dataStorePath, JSON.stringify(store, null, 2), 'utf8');
  console.log(`Updated data-store.json with ${updatedCrackers.length} cracker codes.`);

  const seedContent = `import { Cracker } from '@/types';

export const INITIAL_CRACKERS: Omit<Cracker, 'createdAt' | 'updatedAt'>[] = ${JSON.stringify(
    updatedCrackers.map(({ id, name, itemCode, piecesContent, price, originalPrice, quantity, isAvailable, category, imageUrl }) => ({
      id,
      name,
      itemCode,
      piecesContent,
      price,
      originalPrice,
      quantity,
      isAvailable,
      category,
      imageUrl,
    })),
    null,
    2
  )};
`;
  fs.writeFileSync(seedDataPath, seedContent, 'utf8');
  console.log(`Updated src/lib/seedData.ts with ${updatedCrackers.length} cracker codes.`);
} else {
  console.error('data-store.json not found');
}
