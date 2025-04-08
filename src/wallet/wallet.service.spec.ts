// src/wallet/wallet.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
import { FxService } from '../fx/fx.service';
import { TransactionService } from '../transaction/transaction.service';
import { BadRequestException } from '@nestjs/common';

describe('WalletService', () => {
  let service: WalletService;
  let mockWalletRepository;
  let mockDataSource;
  let mockFxService;
  let mockTransactionService;

  beforeEach(async () => {
    mockWalletRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          findOne: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      }),
    };

    mockFxService = {
      getExchangeRate: jest.fn(),
    };

    mockTransactionService = {
      createTransaction: jest.fn(),
      updateLastTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: FxService,
          useValue: mockFxService,
        },
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fundWallet', () => {
    it('should throw error if amount is not positive', async () => {
      await expect(service.fundWallet('user-id', 'NGN', 0))
        .rejects.toThrow(BadRequestException);
      
      await expect(service.fundWallet('user-id', 'NGN', -100))
        .rejects.toThrow(BadRequestException);
    });
  
    it('should create a new wallet if one does not exist', async () => {
      // Setup
      const queryRunner = mockDataSource.createQueryRunner();
      queryRunner.manager.findOne.mockResolvedValue(null);
      queryRunner.manager.create.mockReturnValue({
        userId: 'user-id',
        currency: 'NGN',
        balance: 1000,
      });
  
      // Execute
      const result = await service.fundWallet('user-id', 'NGN', 1000);
  
      // Assert
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.create).toHaveBeenCalledWith(Wallet, {
        userId: 'user-id',
        currency: 'NGN',
        balance: 1000,
      });
      expect(queryRunner.manager.save).toHaveBeenCalled();
      expect(mockTransactionService.createTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.balance).toBe(1000);
    });
  
    it('should update existing wallet balance', async () => {
      // Setup
      const queryRunner = mockDataSource.createQueryRunner();
      queryRunner.manager.findOne.mockResolvedValue({
        userId: 'user-id',
        currency: 'NGN',
        balance: 500,
      });
  
      // Execute
      const result = await service.fundWallet('user-id', 'NGN', 1000);
  
      // Assert
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalledWith({
        userId: 'user-id',
        currency: 'NGN',
        balance: 1500, // 500 + 1000
      });
      expect(mockTransactionService.createTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.balance).toBe(1500);
    });
  });
  
  describe('convertCurrency', () => {
    it('should throw error if amount is not positive', async () => {
      await expect(service.convertCurrency('user-id', 'NGN', 'USD', 0))
        .rejects.toThrow(BadRequestException);
    });
  
    it('should throw error if source and target currencies are the same', async () => {
      await expect(service.convertCurrency('user-id', 'NGN', 'NGN', 100))
        .rejects.toThrow(BadRequestException);
    });
  
    it('should throw error if source wallet has insufficient balance', async () => {
      // Setup
      const queryRunner = mockDataSource.createQueryRunner();
      mockFxService.getExchangeRate.mockResolvedValue(0.0025); // 1 NGN = 0.0025 USD
      queryRunner.manager.findOne.mockResolvedValueOnce({
        userId: 'user-id',
        currency: 'NGN', 
        balance: 500, // Less than the 1000 we want to convert
      });
  
      // Execute & Assert
      await expect(service.convertCurrency('user-id', 'NGN', 'USD', 1000))
        .rejects.toThrow(BadRequestException);
    });
  
    it('should successfully convert between currencies', async () => {
      // Setup
      const queryRunner = mockDataSource.createQueryRunner();
      mockFxService.getExchangeRate.mockResolvedValue(0.0025); // 1 NGN = 0.0025 USD
      
      // Mock source wallet
      queryRunner.manager.findOne.mockResolvedValueOnce({
        userId: 'user-id',
        currency: 'NGN',
        balance: 1000,
      });
      
      // Mock target wallet (doesn't exist yet)
      queryRunner.manager.findOne.mockResolvedValueOnce(null);
      queryRunner.manager.create.mockReturnValue({
        userId: 'user-id',
        currency: 'USD',
        balance: 0,
      });
  
      // Execute
      const result = await service.convertCurrency('user-id', 'NGN', 'USD', 1000);
  
      // Assert
      expect(mockFxService.getExchangeRate).toHaveBeenCalledWith('NGN', 'USD');
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      
      // Source wallet should be updated (1000 - 1000 = 0)
      expect(queryRunner.manager.save).toHaveBeenCalledWith({
        userId: 'user-id',
        currency: 'NGN',
        balance: 0,
      });
      
      // Target wallet should be updated with converted amount (1000 * 0.0025 = 2.5 USD)
      expect(queryRunner.manager.save).toHaveBeenCalledWith({
        userId: 'user-id',
        currency: 'USD',
        balance: 2.5,
      });
      
      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith({
        userId: 'user-id',
        type: 'CONVERSION',
        sourceCurrency: 'NGN',
        sourceAmount: 1000,
        targetCurrency: 'USD',
        targetAmount: 2.5,
        rate: 0.0025,
        status: 'COMPLETED',
      });
      
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.rate).toBe(0.0025);
    });
  });
});