import { prisma } from '../config/db';
import { env } from '../config/env';
import { getSignedMediaUrl } from '../utils/storage.util'; // you’ll implement this
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function verifyPasscodeService(passcode: string) {
  const now = new Date();

  const accessCode = await prisma.accessCode.findFirst({
    where: {
      code: passcode,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    },
    include: {
      contentSet: {
        include: {
          media: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!accessCode) {
    throw { status: 401, message: 'Invalid or expired passcode' };
  }

  if (!accessCode.contentSet) {
    throw { status: 404, message: 'No content assigned to this code' };
  }

  const transformedMedia = await Promise.all(
    accessCode.contentSet.media.map(async (media) => {
      // YouTube videos
      if (media.source === 'YOUTUBE') {
        return {
          id: media.id,
          type: media.type,
          title: media.title,
          source: 'YOUTUBE',
          youtubeId: media.youtubeId,
        };
      }

      // R2 audio / video
      if (media.source === 'R2') {
        const signedUrl = await getSignedMediaUrl(media.objectKey!);

        return {
          id: media.id,
          type: media.type,
          title: media.title,
          source: 'R2',
          playUrl: signedUrl,
        };
      }

      return null;
    })
  );

  return {
    valid: true,
    content: {
      title: accessCode.contentSet.title,
      media: transformedMedia.filter(Boolean),
    },
  };
}

export async function loginAdminService(password: string, username: string) {
  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const isValid = await bcrypt.compare(password, admin.password);

  if (!isValid) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    env.JWT_SECRET || 'secret',
    { expiresIn: '1d' }
  );

  return { token };
}
