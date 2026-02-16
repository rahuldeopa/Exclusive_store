import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { handleResponse, handleError } from '../utils/response.util';
import { MediaType, MediaSource } from '@prisma/client';
import { deleteFileFromSupabase } from '../utils/storage.util';

export const getAllContent = async (req: Request, res: Response) => {
  try {
    const contentSets = await prisma.contentSet.findMany({
      include: {
        accessCode: true,
        media: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { id: 'desc' },
    });
    handleResponse(res, 200, 'Content fetched successfully', contentSets);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Deleting content set will cascade delete media if configured, 
    // but explicit delete is safer if relations aren't strict cascade
    // Prisma usually requires manual cleanup or onDelete: Cascade in schema.
    // Assuming schema handles it or we do it transactionally
    
    await prisma.$transaction(async (tx) => {
        // Fetch media to delete files from bucket
        const mediaItems = await tx.media.findMany({
            where: { contentSetId: Number(id) }
        });

        for (const item of mediaItems) {
            if (item.source === 'R2' && item.objectKey) {
                try {
                    await deleteFileFromSupabase(item.objectKey);
                } catch (err) {
                    console.error(`Failed to delete file for media ${item.id}:`, err);
                    // Continue deletion even if bucket delete fails? 
                    // Usually yes, to avoid DB being stuck. 
                    // Or no, to ensure consistency? 
                    // Let's warn but proceed.
                }
            }
        }

        // Delete media first
        await tx.media.deleteMany({
            where: { contentSetId: Number(id) }
        });
        
        // Delete content set. AccessCode is unique to ContentSet? 
        // Schema: ContentSet -> AccessCode (relation). AccessCode doesn't have FK to ContentSet, 
        // ContentSet has FK to AccessCode. 
        // We need to find the accessCodeId first if we want to delete it too.
        
        const contentSet = await tx.contentSet.findUnique({
            where: { id: Number(id) }
        });

        if (contentSet) {
             await tx.contentSet.delete({
                where: { id: Number(id) }
            });
            
            await tx.accessCode.delete({
                where: { id: contentSet.accessCodeId }
            });
        }
    }, {
        maxWait: 5000,
        timeout: 10000,
    });

    handleResponse(res, 200, 'Content deleted successfully');
  } catch (error) {
    handleError(res, error);
  }
};

// Update is complex, let's allow updating Title and Media
export const updateContent = async (req: Request, res: Response) => {
    try {
    const { id } = req.params;
    const { title, type, media } = req.body; 

        await prisma.$transaction(async (tx) => {
            // Update Title and Type
            await tx.contentSet.update({
                where: { id: Number(id) },
                data: { title, type }
            });

            // Handle file cleanup for removed media
            // 1. Fetch existing media
            const existingMedia = await tx.media.findMany({
                where: { contentSetId: Number(id) }
            });

            // 2. Identify incoming keys (files we want to KEEP)
            const incomingKeys = new Set(
                (media || [])
                    .filter((m: any) => m.objectKey)
                    .map((m: any) => m.objectKey)
            );

            // 3. Find items that are in DB but NOT in incoming list
            const mediaToDelete = existingMedia.filter(
                m => m.source === 'R2' && m.objectKey && !incomingKeys.has(m.objectKey)
            );

            // 4. Delete orphaned files
            for (const item of mediaToDelete) {
                if (item.objectKey) {
                    try {
                        await deleteFileFromSupabase(item.objectKey);
                    } catch (err) {
                        console.error(`Failed to delete orphaned file ${item.objectKey}:`, err);
                    }
                }
            }

            // Re-create media (simplest approach for "update" where order/items change)
            // Or careful diffing. For now, delete all and recreate is easiest for MVP.
            
            await tx.media.deleteMany({
                where: { contentSetId: Number(id) }
            });

            if (media && Array.isArray(media)) {
               const mediaData = media.map((item: any) => ({
                    type: item.type as MediaType,
                    source: item.source as MediaSource,
                    title: item.title,
                    description: item.description,
                    youtubeId: item.youtubeId,
                    objectKey: item.objectKey,
                    contentSetId: Number(id)
               }));
               
               await tx.media.createMany({
                   data: mediaData
               });
            }
        }, {
            maxWait: 5000, // default: 2000
            timeout: 10000, // default: 5000
        });

        handleResponse(res, 200, 'Content updated successfully');
    } catch (error) {
        handleError(res, error);
    }
};
