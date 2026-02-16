/**
 * Download Curated Pet Photos for Training & Testing
 *
 * Downloads diverse pet photos from Unsplash (free commercial use).
 * Saves to datasets/pet-photos/ (training) and datasets/test-photos/ (held-out test set).
 *
 * Usage: npx tsx scripts/download-pet-photos.ts
 *
 * Downloads ~50 training photos + 10 test photos.
 * Unsplash photos are free for commercial use (no attribution required for API usage).
 */

import * as fs from "fs";
import * as path from "path";

const PET_PHOTOS_DIR = path.join(process.cwd(), "datasets", "pet-photos");
const TEST_PHOTOS_DIR = path.join(process.cwd(), "datasets", "test-photos");

// ─── Curated Unsplash Photo URLs ────────────────────────────────────────────
// All selected for: clear subject, good lighting, front/side facing, no watermarks
// Using w=1024 for consistent resolution

interface PhotoEntry {
  filename: string;
  url: string;
  description: string;
}

// TRAINING SET — 50 diverse pet photos
const TRAINING_PHOTOS: PhotoEntry[] = [
  // Dogs — Labrador (5)
  { filename: "labrador_01.jpg", url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=1024&q=90", description: "Golden Labrador sitting, front-facing" },
  { filename: "labrador_02.jpg", url: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=1024&q=90", description: "Yellow Lab portrait, close-up" },
  { filename: "labrador_03.jpg", url: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=1024&q=90", description: "Chocolate Lab lying down" },
  { filename: "labrador_04.jpg", url: "https://images.unsplash.com/photo-1587559045816-8b0a54d1adbd?w=1024&q=90", description: "Lab puppy sitting" },
  { filename: "labrador_05.jpg", url: "https://images.unsplash.com/photo-1610112645274-1cee1b2ba1f8?w=1024&q=90", description: "Lab outdoor portrait" },

  // Dogs — Indian/Indie (4)
  { filename: "indie-dog_01.jpg", url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1024&q=90", description: "Mixed breed dog, front-facing" },
  { filename: "indie-dog_02.jpg", url: "https://images.unsplash.com/photo-1558929996-da64ba858215?w=1024&q=90", description: "Street dog portrait" },
  { filename: "indie-dog_03.jpg", url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&q=90", description: "Brown indie dog sitting" },
  { filename: "indie-dog_04.jpg", url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=1024&q=90", description: "Mixed breed dog outdoor" },

  // Dogs — Pomeranian (3)
  { filename: "pomeranian_01.jpg", url: "https://images.unsplash.com/photo-1587502537745-84b86da1204f?w=1024&q=90", description: "White Pomeranian portrait" },
  { filename: "pomeranian_02.jpg", url: "https://images.unsplash.com/photo-1607105030332-14b509ea6d2b?w=1024&q=90", description: "Pomeranian close-up" },
  { filename: "pomeranian_03.jpg", url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1024&q=90", description: "Fluffy Pomeranian" },

  // Dogs — German Shepherd (3)
  { filename: "gsd_01.jpg", url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=1024&q=90", description: "German Shepherd portrait" },
  { filename: "gsd_02.jpg", url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=1024&q=90", description: "GSD sitting outdoor" },
  { filename: "gsd_03.jpg", url: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=1024&q=90", description: "GSD close-up face" },

  // Dogs — Pug (3)
  { filename: "pug_01.jpg", url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1024&q=90", description: "Pug front-facing close-up" },
  { filename: "pug_02.jpg", url: "https://images.unsplash.com/photo-1575425186775-b8de9a427e67?w=1024&q=90", description: "Pug sitting" },
  { filename: "pug_03.jpg", url: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=1024&q=90", description: "Pug outdoor portrait" },

  // Dogs — Golden Retriever (3)
  { filename: "golden_01.jpg", url: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=1024&q=90", description: "Golden Retriever portrait" },
  { filename: "golden_02.jpg", url: "https://images.unsplash.com/photo-1612774412771-005ed8e861d2?w=1024&q=90", description: "Golden puppy face" },
  { filename: "golden_03.jpg", url: "https://images.unsplash.com/photo-1625316708582-7c38734be13c?w=1024&q=90", description: "Golden Retriever outdoor" },

  // Dogs — Husky (2)
  { filename: "husky_01.jpg", url: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=1024&q=90", description: "Siberian Husky portrait" },
  { filename: "husky_02.jpg", url: "https://images.unsplash.com/photo-1590419690008-905895e8fe0d?w=1024&q=90", description: "Husky close-up blue eyes" },

  // Dogs — Beagle (2)
  { filename: "beagle_01.jpg", url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=1024&q=90", description: "Beagle portrait" },
  { filename: "beagle_02.jpg", url: "https://images.unsplash.com/photo-1611003228941-98852ba62227?w=1024&q=90", description: "Beagle sitting outdoor" },

  // Dogs — Other breeds (3)
  { filename: "dachshund_01.jpg", url: "https://images.unsplash.com/photo-1612195583950-b8fd34c87093?w=1024&q=90", description: "Dachshund portrait" },
  { filename: "shih-tzu_01.jpg", url: "https://images.unsplash.com/photo-1587463277782-25b12f4639d3?w=1024&q=90", description: "Shih Tzu face" },
  { filename: "corgi_01.jpg", url: "https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=1024&q=90", description: "Corgi portrait" },

  // Cats — Persian (3)
  { filename: "persian-cat_01.jpg", url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=1024&q=90", description: "White Persian cat" },
  { filename: "persian-cat_02.jpg", url: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=1024&q=90", description: "Grey Persian cat" },
  { filename: "persian-cat_03.jpg", url: "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=1024&q=90", description: "Persian kitten" },

  // Cats — Tabby/Indie (4)
  { filename: "tabby-cat_01.jpg", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1024&q=90", description: "Orange tabby cat" },
  { filename: "tabby-cat_02.jpg", url: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=1024&q=90", description: "Tabby cat close-up" },
  { filename: "tabby-cat_03.jpg", url: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=1024&q=90", description: "Striped cat sitting" },
  { filename: "indie-cat_01.jpg", url: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1024&q=90", description: "Cat portrait" },

  // Cats — Black (2)
  { filename: "black-cat_01.jpg", url: "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=1024&q=90", description: "Black cat face" },
  { filename: "black-cat_02.jpg", url: "https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=1024&q=90", description: "Black cat sitting" },

  // Cats — Siamese (2)
  { filename: "siamese_01.jpg", url: "https://images.unsplash.com/photo-1596921573414-9f893e8e5a2a?w=1024&q=90", description: "Siamese cat portrait" },
  { filename: "siamese_02.jpg", url: "https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?w=1024&q=90", description: "Siamese cat face" },

  // Cats — Other (2)
  { filename: "ginger-cat_01.jpg", url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=1024&q=90", description: "Ginger cat close-up" },
  { filename: "calico-cat_01.jpg", url: "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=1024&q=90", description: "Calico cat portrait" },

  // Birds — Parrot (3)
  { filename: "parrot_01.jpg", url: "https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=1024&q=90", description: "Green parrot perched" },
  { filename: "parrot_02.jpg", url: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=1024&q=90", description: "Colorful macaw" },
  { filename: "parrot_03.jpg", url: "https://images.unsplash.com/photo-1534278931827-8a259344abe7?w=1024&q=90", description: "Parakeet close-up" },

  // Rabbit (2)
  { filename: "rabbit_01.jpg", url: "https://images.unsplash.com/photo-1535241749838-299277c6fc2e?w=1024&q=90", description: "White rabbit" },
  { filename: "rabbit_02.jpg", url: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=1024&q=90", description: "Brown rabbit portrait" },

  // Hamster (1)
  { filename: "hamster_01.jpg", url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1024&q=90", description: "Hamster close-up" },
];

// TEST SET — 10 held-out photos (NEVER used in training)
const TEST_PHOTOS: PhotoEntry[] = [
  { filename: "labrador_test.jpg", url: "https://images.unsplash.com/photo-1579213838058-2a77e0411071?w=1024&q=90", description: "Golden Labrador, front-facing (TEST)" },
  { filename: "indie-dog_test.jpg", url: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=1024&q=90", description: "Indian dog, side profile (TEST)" },
  { filename: "pomeranian_test.jpg", url: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=1024&q=90", description: "Pomeranian, sitting (TEST)" },
  { filename: "gsd_test.jpg", url: "https://images.unsplash.com/photo-1553882809-a4f57e59501d?w=1024&q=90", description: "German Shepherd, standing (TEST)" },
  { filename: "persian-cat_test.jpg", url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1024&q=90", description: "White Persian cat (TEST)" },
  { filename: "tabby-cat_test.jpg", url: "https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=1024&q=90", description: "Indie tabby cat (TEST)" },
  { filename: "black-cat_test.jpg", url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&q=90", description: "Black cat, sitting (TEST)" },
  { filename: "parrot_test.jpg", url: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1024&q=90", description: "Green parrot, perched (TEST)" },
  { filename: "pug_test.jpg", url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=1024&q=90", description: "Pug, close-up face (TEST)" },
  { filename: "indie-dark_test.jpg", url: "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=1024&q=90", description: "Dark indie dog, outdoor (TEST)" },
];

// ─── Download Function ──────────────────────────────────────────────────────

async function downloadPhoto(entry: PhotoEntry, dir: string): Promise<boolean> {
  const filepath = path.join(dir, entry.filename);

  // Skip if already downloaded
  if (fs.existsSync(filepath)) {
    console.log(`  Skip (exists): ${entry.filename}`);
    return true;
  }

  try {
    const response = await fetch(entry.url);
    if (!response.ok) {
      console.log(`  FAILED (${response.status}): ${entry.filename}`);
      return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    const sizeKB = (buffer.length / 1024).toFixed(0);
    console.log(`  Downloaded: ${entry.filename} (${sizeKB}KB) — ${entry.description}`);
    return true;
  } catch (err) {
    console.log(`  ERROR: ${entry.filename} — ${err instanceof Error ? err.message : err}`);
    return false;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
=======================================================
  Mirasi Pet Photo Downloader
=======================================================
  Training photos: ${TRAINING_PHOTOS.length} → ${PET_PHOTOS_DIR}
  Test photos:     ${TEST_PHOTOS.length} → ${TEST_PHOTOS_DIR}
=======================================================
`);

  // Ensure directories exist
  fs.mkdirSync(PET_PHOTOS_DIR, { recursive: true });
  fs.mkdirSync(TEST_PHOTOS_DIR, { recursive: true });

  // Download training photos
  console.log("Downloading TRAINING photos...\n");
  let trainSuccess = 0;
  let trainFail = 0;

  for (const photo of TRAINING_PHOTOS) {
    const ok = await downloadPhoto(photo, PET_PHOTOS_DIR);
    if (ok) trainSuccess++;
    else trainFail++;

    // Small delay to be polite to Unsplash CDN
    await new Promise(r => setTimeout(r, 200));
  }

  // Download test photos
  console.log("\n\nDownloading TEST photos (held-out set)...\n");
  let testSuccess = 0;
  let testFail = 0;

  for (const photo of TEST_PHOTOS) {
    const ok = await downloadPhoto(photo, TEST_PHOTOS_DIR);
    if (ok) testSuccess++;
    else testFail++;

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`
=======================================================
  DOWNLOAD COMPLETE
=======================================================
  Training: ${trainSuccess}/${TRAINING_PHOTOS.length} downloaded (${trainFail} failed)
  Test:     ${testSuccess}/${TEST_PHOTOS.length} downloaded (${testFail} failed)

  Training Dir: ${PET_PHOTOS_DIR}
  Test Dir:     ${TEST_PHOTOS_DIR}

  NEXT: Generate training pairs:
  npx tsx scripts/generate-training-pairs.ts warli-art ./datasets/pet-photos
=======================================================
`);
}

main().catch(console.error);
