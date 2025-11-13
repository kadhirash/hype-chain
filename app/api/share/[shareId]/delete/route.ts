import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { handleApiError, validateRequiredFields } from '@/src/lib/apiErrorHandler';

// DELETE /api/shares/:shareId/delete - Soft delete a share (marks as deleted, keeps children)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    const body = await request.json();
    
    const validation = validateRequiredFields(body, ['wallet_address']);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'wallet_address required' },
        { status: 400 }
      );
    }
    
    const { wallet_address } = body;

    // Fetch the share to verify ownership
    const { data: share, error: fetchError } = await supabase
      .from('shares')
      .select('*')
      .eq('id', shareId)
      .single();

    if (fetchError) {
      return handleApiError(fetchError, 'Failed to fetch share');
    }
    
    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    // Verify wallet owns this share
    if (share.wallet_address.toLowerCase() !== wallet_address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own shares' },
        { status: 403 }
      );
    }

    // Check if already deleted
    if (share.is_deleted) {
      return NextResponse.json(
        { error: 'Share is already deleted' },
        { status: 400 }
      );
    }

    // Soft delete the share (mark as deleted, keep in database)
    const { error: updateError } = await supabase
      .from('shares')
      .update({ 
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: wallet_address,
      })
      .eq('id', shareId);

    if (updateError) {
      return handleApiError(updateError, 'Failed to delete share');
    }

    return NextResponse.json({
      success: true,
      message: 'Share deleted successfully. Your contribution to the viral chain is preserved for analytics.',
    });
  } catch (error) {
    return handleApiError(error, 'Failed to delete share');
  }
}

