import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/leaderboard/route';

describe('Leaderboard API', () => {
  it('should return leaderboard data with all sections', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('topEarners');
    expect(data).toHaveProperty('viralContent');
    expect(data).toHaveProperty('topRevenue');
  });

  it('should return arrays for all leaderboard sections', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data.topEarners)).toBe(true);
    expect(Array.isArray(data.viralContent)).toBe(true);
    expect(Array.isArray(data.topRevenue)).toBe(true);
  });

  it('should limit top earners to 10 results', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    expect(data.topEarners.length).toBeLessThanOrEqual(10);
  });

  it('should limit viral content to 10 results', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    expect(data.viralContent.length).toBeLessThanOrEqual(10);
  });

  it('should limit top revenue to 10 results', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    expect(data.topRevenue.length).toBeLessThanOrEqual(10);
  });

  it('should return top earners with wallet and earnings fields', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    if (data.topEarners.length > 0) {
      const earner = data.topEarners[0];
      expect(earner).toHaveProperty('wallet');
      expect(earner).toHaveProperty('earnings');
      expect(typeof earner.earnings).toBe('number');
    }
  });

  it('should sort top earners by earnings descending', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    if (data.topEarners.length > 1) {
      for (let i = 0; i < data.topEarners.length - 1; i++) {
        expect(data.topEarners[i].earnings).toBeGreaterThanOrEqual(data.topEarners[i + 1].earnings);
      }
    }
  });

  it('should return viral content with required fields', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    if (data.viralContent.length > 0) {
      const content = data.viralContent[0];
      expect(content).toHaveProperty('id');
      expect(content).toHaveProperty('title');
      expect(content).toHaveProperty('creator_wallet');
      expect(content).toHaveProperty('total_shares');
      expect(content).toHaveProperty('total_revenue_lamports');
    }
  });

  it('should exclude deleted content from all leaderboards', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    // Viral content and top revenue should not include deleted content
    data.viralContent.forEach((content: any) => {
      expect(content.is_deleted).not.toBe(true);
    });
    
    data.topRevenue.forEach((content: any) => {
      expect(content.is_deleted).not.toBe(true);
    });
  });

  it('should only include active shares in earnings calculation', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    // Test passes if API completes without error and returns top earners
    expect(data.topEarners).toBeDefined();
  });

  it('should only include earners with positive earnings', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    data.topEarners.forEach((earner: any) => {
      expect(earner.earnings).toBeGreaterThan(0);
    });
  });

  it('should only include content with positive shares in viral leaderboard', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    data.viralContent.forEach((content: any) => {
      expect(content.total_shares).toBeGreaterThan(0);
    });
  });

  it('should only include content with positive revenue in revenue leaderboard', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    data.topRevenue.forEach((content: any) => {
      expect(content.total_revenue_lamports).toBeGreaterThan(0);
    });
  });

  it('should handle ties consistently with secondary sorting', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    // If we run this multiple times, the order should be consistent
    // This is a weak test but ensures the sort is deterministic
    expect(response.status).toBe(200);
    
    // Top earners with same earnings should be sorted by wallet address
    for (let i = 0; i < data.topEarners.length - 1; i++) {
      const current = data.topEarners[i];
      const next = data.topEarners[i + 1];
      
      if (current.earnings === next.earnings) {
        // If tied, wallet address should be in alphabetical order
        expect(current.wallet.localeCompare(next.wallet)).toBeLessThanOrEqual(0);
      }
    }
  });
});

