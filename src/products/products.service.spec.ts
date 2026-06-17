
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource } from 'typeorm';
import { execSync } from 'child_process';
import * as path from 'path';
describe('ProductsService (integration)', () => {
  let service: ProductsService;
  let dataSource: DataSource;
  beforeAll(async () => {
    const scriptPath = path.resolve(__dirname, '../../scripts/reset-db.ps1');
    try {
      execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error('Database reset failed', e);
      throw e;
    }
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: '127.0.0.1',
          port: 5432,
          username: 'your_user',
          password: 'your_password',
          database: 'your_database',
          entities: [Product],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([Product]),
      ],
      providers: [ProductsService],
    }).compile();
    service = module.get<ProductsService>(ProductsService);
    dataSource = module.get<DataSource>(DataSource);
  });
  afterAll(async () => {
    await dataSource.destroy();
  });
  it('should create a product and roll back on error', async () => {
    await dataSource.manager.transaction(async (manager) => {
      const createDto = { name: 'Test Product', price: 10, count: 5 } as any;
      const product = await service.create(createDto, 1);
      expect(product.id).toBeDefined();
      try {
        await manager.query('SELECT 1/0');
      } catch (_) {
        throw new Error('Intentional error to test rollback');
      }
    }).catch(() => {
    });
    const all = await service.findAll();
    expect(all).toHaveLength(0);
  });
  it('should keep data consistent after multiple successful operations', async () => {
    const createDto1 = { name: 'Prod A', price: 20, count: 10 } as any;
    const createDto2 = { name: 'Prod B', price: 30, count: 15 } as any;
    await service.create(createDto1, 1);
    await service.create(createDto2, 1);
    const list = await service.findAll();
    expect(list).toHaveLength(2);
    const ids = list.map((p) => p.name);
    expect(ids).toContain('Prod A');
    expect(ids).toContain('Prod B');
  });
});
