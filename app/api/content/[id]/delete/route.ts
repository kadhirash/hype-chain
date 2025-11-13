import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { handleApiError, validateRequiredFields } from '@/src/lib/apiErrorHandler';

// POST /api/content/:id/delete - Soft delete content (marks as deleted, removes from explore)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = validateRequiredFields(body, ['wallet_address']);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'wallet_address required' },
        { status: 400 }
      );
    }
    
    const { wallet_address } = body;

    // Fetch the content to verify ownership
    const { data: content, error: fetchError } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return handleApiError(fetchError, 'Failed to fetch content');
    }
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Verify wallet owns this content
    if (content.creator_wallet.toLowerCase() !== wallet_address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the creator can delete this content' },
        { status: 403 }
      );
    }

    // Check if already deleted
    if (content.is_deleted) {
      return NextResponse.json(
        { error: 'Content is already deleted' },
        { status: 400 }
      );
    }

    // Soft delete the content (mark as deleted, keep in database for analytics)
    const { error: updateError } = await supabase
      .from('content')
      .update({ 
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: wallet_address,
      })
      .eq('id', id);

    if (updateError) {
      return handleApiError(updateError, 'Failed to delete content');
    }

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully. It will no longer appear in the explore page.',
    });
  } catch (error) {
    return handleApiError(error, 'Failed to delete content');
  }
}

