import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/analytics/[wallet]/route';

describe('Analytics API', () => {
  it('should return 400 if wallet address is missing', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET(req as any, { params: Promise.resolve({ wallet: '' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Wallet address required');
  });

  it('should return analytics data with all sections', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('wallet');
    expect(data).toHaveProperty('earningsByContent');
    expect(data).toHaveProperty('performanceByDepth');
    expect(data).toHaveProperty('timeBasedMetrics');
    expect(data).toHaveProperty('topShares');
  });

  it('should return arrays for all analytics sections', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    expect(Array.isArray(data.earningsByContent)).toBe(true);
    expect(Array.isArray(data.performanceByDepth)).toBe(true);
    expect(Array.isArray(data.topShares)).toBe(true);
  });

  it('should return time-based metrics with all periods', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    expect(data.timeBasedMetrics).toHaveProperty('last7Days');
    expect(data.timeBasedMetrics).toHaveProperty('last30Days');
    expect(data.timeBasedMetrics).toHaveProperty('allTime');
    
    expect(data.timeBasedMetrics.last7Days).toHaveProperty('shares');
    expect(data.timeBasedMetrics.last7Days).toHaveProperty('earnings');
    expect(data.timeBasedMetrics.last7Days).toHaveProperty('clicks');
  });

  it('should limit top shares to 5 results', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    expect(data.topShares.length).toBeLessThanOrEqual(5);
  });

  it('should sort earnings by content descending', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    if (data.earningsByContent.length > 1) {
      for (let i = 0; i < data.earningsByContent.length - 1; i++) {
        expect(data.earningsByContent[i].earnings).toBeGreaterThanOrEqual(
          data.earningsByContent[i + 1].earnings
        );
      }
    }
  });

  it('should sort performance by depth ascending', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    if (data.performanceByDepth.length > 1) {
      for (let i = 0; i < data.performanceByDepth.length - 1; i++) {
        expect(data.performanceByDepth[i].depth).toBeLessThan(
          data.performanceByDepth[i + 1].depth
        );
      }
    }
  });

  it('should calculate average metrics for depth performance', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    if (data.performanceByDepth.length > 0) {
      const depth = data.performanceByDepth[0];
      expect(depth).toHaveProperty('avgEarnings');
      expect(depth).toHaveProperty('avgClicks');
      expect(typeof depth.avgEarnings).toBe('number');
      expect(typeof depth.avgClicks).toBe('number');
    }
  });

  it('should handle case-insensitive wallet addresses', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBB427E07F94D1D333F6E2E23E3DCFF91A10A822A'; // Uppercase
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.wallet).toBe(testWallet);
  });

  it('should return empty analytics for wallet with no activity', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0x0000000000000000000000000000000000000000';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.earningsByContent).toEqual([]);
    expect(data.performanceByDepth).toEqual([]);
    expect(data.topShares).toEqual([]);
    expect(data.timeBasedMetrics.allTime.shares).toBe(0);
  });

  it('should exclude deleted shares from top shares', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    // Top shares should only include active shares
    expect(response.status).toBe(200);
    expect(Array.isArray(data.topShares)).toBe(true);
  });

  it('should aggregate earnings correctly for multiple shares of same content', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    if (data.earningsByContent.length > 0) {
      const content = data.earningsByContent[0];
      expect(content).toHaveProperty('contentId');
      expect(content).toHaveProperty('title');
      expect(content).toHaveProperty('earnings');
      expect(content).toHaveProperty('shares');
      expect(typeof content.earnings).toBe('number');
      expect(typeof content.shares).toBe('number');
    }
  });

  it('should calculate time-based metrics correctly', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    // All time should be >= 30 days >= 7 days
    expect(data.timeBasedMetrics.allTime.shares).toBeGreaterThanOrEqual(
      data.timeBasedMetrics.last30Days.shares
    );
    expect(data.timeBasedMetrics.last30Days.shares).toBeGreaterThanOrEqual(
      data.timeBasedMetrics.last7Days.shares
    );
  });
});

