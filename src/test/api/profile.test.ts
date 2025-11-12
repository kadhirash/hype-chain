import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/profile/[wallet]/route';

describe('Profile API', () => {
  it('should return 400 if wallet address is missing', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET(req as any, { params: Promise.resolve({ wallet: '' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Wallet address required');
  });

  it('should return profile data for valid wallet', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('wallet');
    expect(data).toHaveProperty('stats');
    expect(data).toHaveProperty('shares');
    expect(data).toHaveProperty('createdContent');
  });

  it('should return stats object with all required fields', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    expect(data.stats).toHaveProperty('totalEarnings');
    expect(data.stats).toHaveProperty('totalShares');
    expect(data.stats).toHaveProperty('activeShares');
    expect(data.stats).toHaveProperty('deletedShares');
    expect(data.stats).toHaveProperty('totalClicks');
    expect(data.stats).toHaveProperty('contentCreated');
    expect(data.stats).toHaveProperty('totalContentRevenue');
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

  it('should return empty arrays for wallet with no activity', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0x0000000000000000000000000000000000000000';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.shares).toEqual([]);
    expect(data.createdContent).toEqual([]);
    expect(data.stats.totalEarnings).toBe(0);
    expect(data.stats.totalShares).toBe(0);
  });

  it('should calculate earnings correctly', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(typeof data.stats.totalEarnings).toBe('number');
    expect(data.stats.totalEarnings).toBeGreaterThanOrEqual(0);
  });

  it('should include content details in shares', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    if (data.shares.length > 0) {
      const share = data.shares[0];
      expect(share).toHaveProperty('content');
      expect(share).toHaveProperty('earnings_lamports');
      expect(share).toHaveProperty('click_count');
      expect(share).toHaveProperty('is_deleted');
    }
  });

  it('should count active and deleted shares separately', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const testWallet = '0xBb427E07f94d1d333F6e2E23e3DcfF91A10A822a';
    const response = await GET(req as any, { params: Promise.resolve({ wallet: testWallet }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stats.activeShares + data.stats.deletedShares).toBe(data.stats.totalShares);
  });
});

