import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// MEETING NOTES
// ============================================================================

// Create a meeting note
const createNoteSchema = z.object({
  aboutUserId: z.string(),
  teeTimeId: z.string().optional(),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  contactInfo: z.record(z.string()).optional(),
});

router.post('/notes', async (req: Request, res: Response) => {
  try {
    // In production, get userId from auth
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = createNoteSchema.parse(req.body);

    const note = await prisma.meetingNote.create({
      data: {
        userId,
        aboutUserId: data.aboutUserId,
        teeTimeId: data.teeTimeId,
        content: data.content,
        tags: data.tags,
        contactInfo: data.contactInfo,
      },
      include: {
        aboutUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            company: true,
            jobTitle: true,
            industry: true,
          },
        },
        teeTime: {
          include: {
            course: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({ data: note });
  } catch (error) {
    console.error('Error creating note:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Get user's meeting notes
router.get('/notes', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { tag, search } = req.query;

    const notes = await prisma.meetingNote.findMany({
      where: {
        userId,
        ...(tag ? { tags: { has: tag as string } } : {}),
        ...(search
          ? {
              OR: [
                { content: { contains: search as string, mode: 'insensitive' } },
                { aboutUser: { firstName: { contains: search as string, mode: 'insensitive' } } },
                { aboutUser: { lastName: { contains: search as string, mode: 'insensitive' } } },
                { aboutUser: { company: { contains: search as string, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        aboutUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            company: true,
            jobTitle: true,
            industry: true,
          },
        },
        teeTime: {
          include: {
            course: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ data: notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Update a meeting note
router.patch('/notes/:noteId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { noteId } = req.params;
    const { content, tags } = req.body;

    const note = await prisma.meetingNote.updateMany({
      where: { id: noteId, userId },
      data: {
        ...(content !== undefined ? { content } : {}),
        ...(tags !== undefined ? { tags } : {}),
      },
    });

    if (note.count === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote = await prisma.meetingNote.findUnique({
      where: { id: noteId },
      include: {
        aboutUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            company: true,
            jobTitle: true,
          },
        },
      },
    });

    res.json({ data: updatedNote });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a meeting note
router.delete('/notes/:noteId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { noteId } = req.params;

    const result = await prisma.meetingNote.deleteMany({
      where: { id: noteId, userId },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ============================================================================
// PLAYER REVIEWS
// ============================================================================

const createReviewSchema = z.object({
  revieweeId: z.string(),
  teeTimeId: z.string(),
  rating: z.number().min(1).max(5),
  playAgain: z.boolean(),
  punctuality: z.number().min(1).max(5).optional(),
  pace: z.number().min(1).max(5).optional(),
  etiquette: z.number().min(1).max(5).optional(),
  networking: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
  isPublic: z.boolean().default(false),
});

// Create a review
router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const reviewerId = req.headers['x-user-id'] as string;
    if (!reviewerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = createReviewSchema.parse(req.body);

    // Verify reviewer was part of the tee time
    const slot = await prisma.teeTimeSlot.findFirst({
      where: {
        teeTimeId: data.teeTimeId,
        userId: reviewerId,
      },
    });

    if (!slot) {
      return res.status(403).json({ error: 'You were not part of this tee time' });
    }

    const review = await prisma.playerReview.create({
      data: {
        reviewerId,
        revieweeId: data.revieweeId,
        teeTimeId: data.teeTimeId,
        rating: data.rating,
        playAgain: data.playAgain,
        punctuality: data.punctuality,
        pace: data.pace,
        etiquette: data.etiquette,
        networking: data.networking,
        comment: data.comment,
        isPublic: data.isPublic,
      },
      include: {
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({ data: review });
  } catch (error) {
    console.error('Error creating review:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get reviews for a user (public reviews)
router.get('/reviews/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.playerReview.findMany({
      where: {
        revieweeId: userId,
        isPublic: true,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        teeTime: {
          include: {
            course: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats
    const stats = {
      totalReviews: reviews.length,
      averageRating:
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0,
      wouldPlayAgainPercent:
        reviews.length > 0
          ? Math.round(
              (reviews.filter((r) => r.playAgain).length / reviews.length) * 100
            )
          : 0,
      punctualityAvg: calculateAverage(reviews.map((r) => r.punctuality)),
      paceAvg: calculateAverage(reviews.map((r) => r.pace)),
      etiquetteAvg: calculateAverage(reviews.map((r) => r.etiquette)),
      networkingAvg: calculateAverage(reviews.map((r) => r.networking)),
    };

    res.json({ data: { reviews, stats } });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

function calculateAverage(values: (number | null | undefined)[]): number | undefined {
  const validValues = values.filter((v): v is number => v !== null && v !== undefined);
  if (validValues.length === 0) return undefined;
  return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
}

// ============================================================================
// CONNECTIONS
// ============================================================================

const createConnectionSchema = z.object({
  receiverId: z.string(),
  teeTimeId: z.string().optional(),
  message: z.string().optional(),
});

// Send a connection request
router.post('/connections', async (req: Request, res: Response) => {
  try {
    const requesterId = req.headers['x-user-id'] as string;
    if (!requesterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = createConnectionSchema.parse(req.body);

    // Check if connection already exists
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, receiverId: data.receiverId },
          { requesterId: data.receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Connection already exists' });
    }

    const connection = await prisma.connection.create({
      data: {
        requesterId,
        receiverId: data.receiverId,
        teeTimeId: data.teeTimeId,
        message: data.message,
      },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            company: true,
          },
        },
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: data.receiverId,
        type: 'MATCH_FOUND',
        title: 'New Connection Request',
        body: `Someone wants to connect with you!`,
        data: { connectionId: connection.id, requesterId },
      },
    });

    res.status(201).json({ data: connection });
  } catch (error) {
    console.error('Error creating connection:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create connection' });
  }
});

// Get user's connections
router.get('/connections', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status } = req.query;

    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
        ...(status ? { status: status as any } : {}),
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            company: true,
            jobTitle: true,
            industry: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            company: true,
            jobTitle: true,
            industry: true,
          },
        },
        teeTime: {
          include: {
            course: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({ data: connections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Respond to a connection request
router.patch('/connections/:connectionId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { connectionId } = req.params;
    const { status } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const connection = await prisma.connection.updateMany({
      where: {
        id: connectionId,
        receiverId: userId,
        status: 'PENDING',
      },
      data: { status },
    });

    if (connection.count === 0) {
      return res.status(404).json({ error: 'Connection not found or already responded' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating connection:', error);
    res.status(500).json({ error: 'Failed to update connection' });
  }
});

export { router as connectRoutes };
