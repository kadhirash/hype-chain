import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Build hierarchical tree structure from flat shares data
function buildViralTree(shares: any[]) {
  const shareMap = new Map();
  const rootNodes: any[] = [];

  // First pass: create map of all shares
  shares.forEach((share) => {
    shareMap.set(share.id, {
      ...share,
      children: [],
    });
  });

  // Second pass: build tree structure
  shares.forEach((share) => {
    const node = shareMap.get(share.id);
    
    if (!share.parent_share_id) {
      // Root node (creator's share)
      rootNodes.push(node);
    } else {
      // Child node - add to parent
      const parent = shareMap.get(share.parent_share_id);
      if (parent) {
        parent.children.push(node);
      } else {
        // Parent not found, treat as root
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await params;

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Fetch all shares for this content, ordered by creation time
    const { data: shares, error } = await supabase
      .from('shares')
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shares' },
        { status: 500 }
      );
    }

    if (!shares || shares.length === 0) {
      return NextResponse.json({
        contentId,
        tree: [],
        totalShares: 0,
        maxDepth: 0,
      });
    }

    // Build hierarchical tree
    const tree = buildViralTree(shares);

    // Calculate max depth
    function getMaxDepth(nodes: any[]): number {
      if (!nodes || nodes.length === 0) return 0;
      return 1 + Math.max(...nodes.map((node) => getMaxDepth(node.children)));
    }

    const maxDepth = getMaxDepth(tree);

    // Calculate breadth at each level
    function getBreadthByLevel(nodes: any[], level = 0, breadthMap = new Map()): Map<number, number> {
      if (!nodes || nodes.length === 0) return breadthMap;
      
      breadthMap.set(level, (breadthMap.get(level) || 0) + nodes.length);
      
      nodes.forEach((node) => {
        getBreadthByLevel(node.children, level + 1, breadthMap);
      });
      
      return breadthMap;
    }

    const breadthByLevel = getBreadthByLevel(tree);
    const levelStats = Array.from(breadthByLevel.entries()).map(([level, count]) => ({
      level,
      shareCount: count,
    }));

    return NextResponse.json({
      contentId,
      tree,
      totalShares: shares.length,
      maxDepth,
      levelStats,
      creatorShare: tree[0] || null,
    });
  } catch (error) {
    console.error('Error building viral tree:', error);
    return NextResponse.json(
      { error: 'Failed to build viral tree' },
      { status: 500 }
    );
  }
}
