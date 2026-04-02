import { prisma } from '../config/db';
import { MediaType, MediaSource } from '@prisma/client';
import { extractYouTubeId } from '../utils/youtube.util';

type CreateContentInput = {
  code: string;
  expiresAt?: string;
  content: {
    title: string;
    type: 'MUSIC' | 'AUDIOBOOK' | 'SHORT_FILM' | 'DIGITAL_BOOK';
    media: {
      type: 'VIDEO' | 'AUDIO' | 'DOCUMENT';
      source: 'YOUTUBE' | 'R2' | 'SOUNDCLOUD';
      title: string;
      url: string; // yt link OR uploaded file path
      order?: number;
    }[];
  };
};

export async function createContentSetService(input: CreateContentInput) {
  return prisma.$transaction(async (tx) => {
    // 1️⃣ Create access code
    const accessCode = await tx.accessCode.create({
      data: {
        code: input.code,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
    });

    // 2️⃣ Create content set
    const contentSet = await tx.contentSet.create({
      data: {
        title: input.content.title,
        type: input.content.type,
        accessCodeId: accessCode.id,
      },
    });

    // 3️⃣ Prepare media records
    const mediaData = input.content.media.map((item) => {
      if (item.source === 'YOUTUBE') {
        const videoId = extractYouTubeId(item.url);
        if (!videoId) {
          throw new Error(`Invalid YouTube URL: ${item.url}`);
        }

        return {
          type: MediaType.VIDEO,
          source: MediaSource.YOUTUBE,
          title: item.title,
          youtubeId: videoId,
          order: item.order,
          contentSetId: contentSet.id,
        };
      }

      if (item.source === 'SOUNDCLOUD') {
        return {
          type: MediaType.AUDIO,
          source: MediaSource.SOUNDCLOUD,
          title: item.title,
          objectKey: item.url,
          order: item.order,
          contentSetId: contentSet.id,
        };
      }

      if (item.source === 'R2') {
        return {
          type: item.type === 'DOCUMENT' ? MediaType.DOCUMENT : (item.type === 'VIDEO' ? MediaType.VIDEO : MediaType.AUDIO),
          source: MediaSource.R2,
          title: item.title,
          objectKey: item.url,
          order: item.order,
          contentSetId: contentSet.id,
        };
      }

      throw new Error('Unsupported media source');
    });

    // 4️⃣ Insert media
    await tx.media.createMany({
      data: mediaData,
    });

    return {
      success: true,
      accessCode: accessCode.code,
      contentSetId: contentSet.id,
      mediaCount: mediaData.length,
    };
  });
}
