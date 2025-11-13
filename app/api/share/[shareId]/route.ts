import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { handleApiError } from '@/src/lib/apiErrorHandler';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;

    const { data: share, error } = await supabase
      .from('shares')
      .select('*')
      .eq('id', shareId)
      .single();

    if (error) {
      return handleApiError(error, 'Failed to fetch share');
    }
    
    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ share });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch share');
  }
}

