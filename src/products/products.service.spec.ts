import { ConflictException } from '@nestjs/common';
import { ProductsService } from './products.service';

const product = {
  id: 1,
  count: 10,
  price: 25,
  photo: 'product.jpg',
  details: 'Test product',
  deletedAt: null,
};

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Record<string, jest.Mock>;
  let dataSource: Record<string, jest.Mock>;
  let companiesService: Record<string, jest.Mock>;
  let cache: Record<string, jest.Mock>;
  let configService: Record<string, jest.Mock>;

  beforeEach(() => {
    productRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(),
    };
    companiesService = {
      findOneByUser: jest.fn(),
    };
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
    configService = {
      get: jest.fn(),
    };

    service = new ProductsService(
      productRepository as any,
      dataSource as any,
      companiesService as any,
      cache as any,
      configService as any,
    );
  });

  it('returns a cached product without querying PostgreSQL', async () => {
    cache.get.mockResolvedValue(product);

    await expect(service.findOne(product.id)).resolves.toEqual(product);
    expect(productRepository.findOne).not.toHaveBeenCalled();
  });

  it('decreases stock while holding a database lock', async () => {
    const entityManager = {
      findOne: jest.fn().mockResolvedValue(product),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    await service.decreaseStock(
      [{ productId: product.id, quantity: 3 }],
      entityManager as any,
    );

    expect(entityManager.findOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
    expect(entityManager.update).toHaveBeenCalledWith(
      expect.anything(),
      { id: product.id },
      { count: 7 },
    );
    expect(cache.delete).toHaveBeenCalled();
  });

  it('rejects checkout when stock is insufficient', async () => {
    const entityManager = {
      findOne: jest.fn().mockResolvedValue({ ...product, count: 1 }),
      update: jest.fn(),
    };

    await expect(
      service.decreaseStock(
        [{ productId: product.id, quantity: 2 }],
        entityManager as any,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(entityManager.update).not.toHaveBeenCalled();
  });
});
