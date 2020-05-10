import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transasactionsRepositiry = getCustomRepository(
      TransactionsRepository,
    );

    const categoryRepository = getRepository(Category);

    const { total } = await transasactionsRepositiry.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('not have enougth balance');
    }

    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = transasactionsRepositiry.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transasactionsRepositiry.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
