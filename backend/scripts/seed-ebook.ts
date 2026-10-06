import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passcode = 'followgod';

  console.log('Seeding ebook for passcode:', passcode);

  // Check if passcode already exists
  let accessCode = await prisma.accessCode.findUnique({
    where: { code: passcode }
  });

  if (!accessCode) {
    accessCode = await prisma.accessCode.create({
      data: {
        code: passcode,
        isActive: true,
      }
    });
    console.log('Created AccessCode:', accessCode);
  } else {
    console.log('AccessCode already exists:', accessCode);
  }

  // Create ContentSet
  const contentSet = await prisma.contentSet.upsert({
    where: { accessCodeId: accessCode.id },
    update: {
      title: 'Weight of Scars 2',
      type: 'DIGITAL_BOOK',
    },
    create: {
      title: 'Weight of Scars 2',
      type: 'DIGITAL_BOOK',
      accessCodeId: accessCode.id,
    }
  });
  console.log('Upserted ContentSet:', contentSet);

  // Delete existing media for this ContentSet to avoid duplicates
  await prisma.media.deleteMany({
    where: { contentSetId: contentSet.id }
  });

  // Create Media for epub
  const media = await prisma.media.create({
    data: {
      title: 'Weight of Scars 2',
      type: 'DOCUMENT',
      source: 'R2',
      objectKey: 'local:uploads/Weight of Scars 2.epub',
      contentSetId: contentSet.id,
    }
  });

  console.log('Created Media:', media);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
