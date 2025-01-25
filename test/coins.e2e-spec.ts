import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coin } from '../src/coins/entities/coin.entity';
import { Repository, DataSource } from 'typeorm';

describe('CoinsController (e2e)', () => {
  let app: INestApplication;
  let coinRepository: Repository<Coin>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    coinRepository = moduleFixture.get<Repository<Coin>>(getRepositoryToken(Coin));
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();
  });

  beforeEach(async () => {
    try {
      // Disable foreign key constraints temporarily
      await dataSource.query('SET CONSTRAINTS ALL DEFERRED');
      
      // Clear all tables in the correct order
      await dataSource.query('DELETE FROM candles');
      await dataSource.query('DELETE FROM coin_exchanges');
      await dataSource.query('DELETE FROM exchanges');
      await dataSource.query('DELETE FROM coins');
      
      // Re-enable foreign key constraints
      await dataSource.query('SET CONSTRAINTS ALL IMMEDIATE');
    } catch (error) {
      console.error('Error during table cleanup:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // Clean up all data
      await dataSource.query('SET CONSTRAINTS ALL DEFERRED');
      await dataSource.query('DELETE FROM candles');
      await dataSource.query('DELETE FROM coin_exchanges');
      await dataSource.query('DELETE FROM exchanges');
      await dataSource.query('DELETE FROM coins');
      await dataSource.query('SET CONSTRAINTS ALL IMMEDIATE');
      
      // Close connections
      await dataSource.destroy();
      await app.close();
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  });

  describe('/coins (GET)', () => {
    it('should return an empty array when no coins exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/coins')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all coins when they exist', async () => {
      // Create test coins
      const testCoins = [
        { name: 'Bitcoin', symbol: 'BTC' },
        { name: 'Ethereum', symbol: 'ETH' }
      ];
      
      await coinRepository.save(testCoins);

      const response = await request(app.getHttpServer())
        .get('/coins')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Bitcoin',
            symbol: 'BTC'
          }),
          expect.objectContaining({
            name: 'Ethereum',
            symbol: 'ETH'
          })
        ])
      );
    });
  });

  describe('/coins/update (POST)', () => {
    it('should update coins from CoinGecko', async () => {
      const response = await request(app.getHttpServer())
        .post('/coins/update')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Coins updated successfully'
      });

      // Verify that coins were actually saved
      const savedCoins = await coinRepository.find();
      expect(savedCoins.length).toBeGreaterThan(0);
      
      // Check if common coins like Bitcoin and Ethereum are present
      const symbols = savedCoins.map(coin => coin.symbol);
      expect(symbols).toContain('BTC');
      expect(symbols).toContain('ETH');
    }, 30000); // Increase timeout for external API call

    it('should handle duplicate coins correctly', async () => {
      // First update
      await request(app.getHttpServer())
        .post('/coins/update')
        .expect(200);

      const firstUpdateCoins = await coinRepository.find();

      // Second update
      await request(app.getHttpServer())
        .post('/coins/update')
        .expect(200);

      const secondUpdateCoins = await coinRepository.find();

      // The number of coins should remain relatively stable
      expect(Math.abs(secondUpdateCoins.length - firstUpdateCoins.length)).toBeLessThan(5);
    }, 30000); // Increase timeout for external API calls
  });
}); 