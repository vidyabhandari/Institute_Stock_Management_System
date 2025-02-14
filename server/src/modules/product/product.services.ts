/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import CustomError from '../../errors/customError';
import sortAndPaginatePipeline from '../../lib/sortAndPaginate.pipeline';
import BaseServices from '../baseServices';
import Purchase from '../purchase/purchase.model';
import Seller from '../seller/seller.model';
import matchStagePipeline from './product.aggregation.pipeline';
import { IProduct } from './product.interface';
import Product from './product.model';

class ProductServices extends BaseServices<any> {
  constructor(model: any, modelName: string) {
    super(model, modelName);
  }

  /**
   * Create new product
   */
  async create(payload: IProduct, userId: string) {
    // Step 1: Validate payload data
    if (!payload.seller || !payload.name || !payload.stock || !payload.price) {
      throw new CustomError(400, 'Missing required fields: seller, name, stock, price');
    }

    // Clean up payload by removing null or empty fields
    type str = keyof IProduct;
    (Object.keys(payload) as str[]).forEach((key: str) => {
      if (payload[key] == null || payload[key] === '') {
        delete payload[key];
      }
    });

    payload.user = new Types.ObjectId(userId);
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Step 2: Check if seller exists
      const seller = await Seller.findById(payload.seller);
      if (!seller) {
        throw new CustomError(400, 'Invalid seller ID');
      }

      // Step 3: Create product
      const product: any = await this.model.create([payload], { session });

      // Step 4: Add to Purchase collection
      await Purchase.create(
        [
          {
            user: userId,
            seller: product[0]?.seller,
            product: product[0]?._id,
            sellerName: seller?.name,
            productName: product[0]?.name,
            quantity: Number(product[0]?.stock),
            unitPrice: Number(product[0]?.price),
            totalPrice: Number(product[0]?.stock) * Number(product[0]?.price),
          }
        ],
        { session }
      );

      // Step 5: Commit the transaction
      await session.commitTransaction();

      console.log('Created product:', product);  // Log created product for debugging

      return product;
    } 
    catch (error) {
      console.error('Error during product creation:', error);  // Log error for debugging
      await session.abortTransaction();
      throw new CustomError(400, 'Product creation failed');
    } finally {
      await session.endSession();
    }
  }

  /**
   * Count Total Product
   */
  async countTotalProduct(userId: string) {
    return this.model.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      { $group: { _id: null, totalQuantity: { $sum: '$stock' } } },
      { $project: { totalQuantity: 1, _id: 0 } }
    ]);
  }

  /**
   * Get All product of user
   */
  async readAll(query: Record<string, unknown> = {}, userId: string) {
    let data = await this.model.aggregate([
      ...matchStagePipeline(query, userId),
      ...sortAndPaginatePipeline(query)
    ]);

    const totalCount = await this.model.aggregate([
      ...matchStagePipeline(query, userId),
      { $group: { _id: null, total: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ]);

    data = await this.model.populate(data, { path: 'category', select: '-__v -user' });
    data = await this.model.populate(data, { path: 'brand', select: '-__v -user' });
    data = await this.model.populate(data, { path: 'seller', select: '-__v -user -createdAt -updatedAt' });

    return { data, totalCount };
  }

  /**
   * Get Single product of user
   */
  async read(id: string, userId: string) {
    await this._isExists(id);
    return this.model.findOne({ user: new Types.ObjectId(userId), _id: id });
  }

  /**
   * Multiple delete
   */
  async bulkDelete(payload: string[]) {
    const data = payload.map((item) => new Types.ObjectId(item));
    return this.model.deleteMany({ _id: { $in: data } });
  }

  /**
   * Add product to stock
   */
  async addToStock(id: string, payload: Pick<IProduct, 'seller' | 'stock'>, userId: string) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const seller = await Seller.findById(payload.seller);
      if (!seller) {
        throw new CustomError(400, 'Invalid seller ID');
      }

      const product: any = await this.model.findByIdAndUpdate(
        id,
        { $inc: { stock: payload.stock } },
        { session, new: true }
      );

      await Purchase.create(
        [
          {
            user: userId,
            seller: product.seller,
            product: product._id,
            sellerName: seller?.name,
            productName: product.name,
            quantity: Number(product.stock),
            unitPrice: Number(product.price),
            totalPrice: Number(product.stock) * Number(product.price),
          }
        ],
        { session }
      );

      await session.commitTransaction();

      console.log('Updated product:', product);  // Log updated product for debugging

      return product;
    } catch (error) {
      console.error('Error during adding to stock:', error);  // Log error for debugging
      await session.abortTransaction();
      throw new CustomError(400, 'Product update failed');
    } finally {
      await session.endSession();
    }
  }
}

const productServices = new ProductServices(Product, 'Product');
export default productServices;
