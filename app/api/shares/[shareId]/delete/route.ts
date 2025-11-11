import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// DELETE /api/shares/:shareId/delete - Soft delete a share (marks as deleted, keeps children)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    const { wallet_address } = await request.json();

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'wallet_address required' },
        { status: 400 }
      );
    }

    // Fetch the share to verify ownership
    const { data: share, error: fetchError } = await supabase
      .from('shares')
      .select('*')
      .eq('id', shareId)
      .single();

    if (fetchError || !share) {
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
      .update({ is_deleted: true })
      .eq('id', shareId);

    if (updateError) {
      console.error('Error deleting share:', updateError);
      return NextResponse.json(
        { error: 'Failed to delete share' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Share deleted successfully. Your contribution to the viral chain is preserved for analytics.',
    });
  } catch (error) {
    console.error('Delete share error:', error);
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 }
    );
  }
}

