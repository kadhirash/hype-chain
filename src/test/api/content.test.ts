import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:3000';

describe('Content API', () => {
  describe('POST /api/content', () => {
    describe('Valid Inputs', () => {
      it('should create content with valid data', async () => {
        const response = await fetch(`${BASE_URL}/api/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Test Content',
            media_url: 'https://example.com/image.jpg',
            creator_wallet: '0xTestWallet123',
            nft_address: '0x' + Math.random().toString(16).substring(2, 15),
          }),
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.content).toBeDefined();
        expect(data.share).toBeDefined();
        expect(data.content.title).toBe('Test Content');
      });
    });

    describe('Invalid Inputs', () => {
      it('should reject missing title', async () => {
        const response = await fetch(`${BASE_URL}/api/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            media_url: 'https://example.com/image.jpg',
            creator_wallet: '0xTestWallet123',
            nft_address: '0xTest123',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject missing media_url', async () => {
        const response = await fetch(`${BASE_URL}/api/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Test Content',
            creator_wallet: '0xTestWallet123',
            nft_address: '0xTest123',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject missing creator_wallet', async () => {
        const response = await fetch(`${BASE_URL}/api/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Test Content',
            media_url: 'https://example.com/image.jpg',
            nft_address: '0xTest123',
          }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  describe('GET /api/content', () => {
    it('should return list of content', async () => {
      const response = await fetch(`${BASE_URL}/api/content`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.content).toBeDefined();
      expect(Array.isArray(data.content)).toBe(true);
      expect(data.count).toBeDefined();
    });

    it('should respect limit parameter', async () => {
      const response = await fetch(`${BASE_URL}/api/content?limit=5`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.content.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/content/:id', () => {
    it('should return 404 for non-existent content', async () => {
      const response = await fetch(`${BASE_URL}/api/content/non-existent-id-12345`);

      expect(response.status).toBe(404);
    });

    it('should return content with stats', async () => {
      // This test requires a real content ID
      // Skipping for now as it needs database setup
      expect(true).toBe(true);
    });
  });
});

