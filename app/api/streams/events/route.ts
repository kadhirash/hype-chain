import { NextRequest } from 'next/server';
import {
  subscribeToContentCreated,
  subscribeToShareCreated,
  subscribeToEngagementRecorded,
} from '@/lib/dataStreams';

// Server-Sent Events endpoint for real-time blockchain events
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const contentId = searchParams.get('contentId');

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)
      );

      // Subscribe to ContentCreated events
      const unsubscribeContent = subscribeToContentCreated((event) => {
        const data = {
          type: 'ContentCreated',
          data: {
            contentId: event.contentId.toString(),
            creator: event.creator,
            contentURI: event.contentURI,
            timestamp: event.timestamp.toString(),
          },
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      });

      // Subscribe to ShareCreated events
      const unsubscribeShare = subscribeToShareCreated((event) => {
        // Filter by contentId if provided
        if (contentId && event.contentId.toString() !== contentId) {
          return;
        }

        const data = {
          type: 'ShareCreated',
          data: {
            shareId: event.shareId.toString(),
            contentId: event.contentId.toString(),
            sharer: event.sharer,
            parentShareId: event.parentShareId.toString(),
            depth: event.depth.toString(),
            timestamp: event.timestamp.toString(),
          },
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      });

      // Subscribe to EngagementRecorded events
      const unsubscribeEngagement = subscribeToEngagementRecorded((event) => {
        // Filter by contentId if provided
        if (contentId && event.contentId.toString() !== contentId) {
          return;
        }

        const data = {
          type: 'EngagementRecorded',
          data: {
            shareId: event.shareId.toString(),
            contentId: event.contentId.toString(),
            user: event.user,
            engagementType: event.engagementType,
            timestamp: event.timestamp.toString(),
          },
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      });

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, 30000); // Every 30 seconds

      // Cleanup on connection close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribeContent();
        unsubscribeShare();
        unsubscribeEngagement();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

