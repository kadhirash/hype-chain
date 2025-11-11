import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/content - Create new content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { nft_address, creator_wallet, title, media_url } = body

    // Validate required fields
    if (!nft_address || !creator_wallet || !title || !media_url) {
      return NextResponse.json(
        { error: 'Missing required fields: nft_address, creator_wallet, title, media_url' },
        { status: 400 }
      )
    }

    // Insert content into database
    const { data: content, error } = await supabase
      .from('content')
      .insert({
        nft_address,
        creator_wallet,
        title,
        media_url,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create content', details: error.message },
        { status: 500 }
      )
    }

    // Create initial share for the creator (depth 0, no parent)
    const shareId = crypto.randomUUID()
    const { data: creatorShare, error: shareError } = await supabase
      .from('shares')
      .insert({
        id: shareId,
        content_id: content.id,
        wallet_address: creator_wallet,
        parent_share_id: null,
        share_depth: 0,
        share_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${shareId}`,
      })
      .select()
      .single()

    if (shareError) {
      console.error('Share creation error:', shareError)
      // Content was created but share failed - still return content
      return NextResponse.json(
        { 
          content,
          warning: 'Content created but initial share failed',
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      {
        content,
        share: creatorShare,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/content - List all content (with pagination)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ content, count: content.length })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

