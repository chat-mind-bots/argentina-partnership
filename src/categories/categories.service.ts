import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from 'src/categories/ctegories.schema';
import { CreateCategoryDto } from 'src/categories/dto/create-category.dto';
import { GetCategoryDto } from 'src/categories/dto/query/get-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findCategoryByTitle(title: string) {
    const category = await this.categoryModel.findOne({ title });
    if (!category) {
      throw new HttpException(
        'Document (Category) not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return category;
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new HttpException(
        'Document (Category) not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return category;
  }

  async findAllCategories() {
    const categories = await this.categoryModel.find();
    return categories;
  }

  async findAllCategoriesWithTotal(params: GetCategoryDto) {
    const filter = {};
    const sort = {};
    if (params.q) {
      filter['$or'] = [{ title: { $regex: params.q, $options: 'i' } }];
    }
    if (params['sort-by']) {
      sort[params['sort-by']] = params['sort-order'] === 'asc' ? 1 : -1;
    }
    const categories = await this.categoryModel
      .find({ ...filter })
      .skip(params.offset)
      .limit(params.limit);

    const total = await this.categoryModel.countDocuments({ ...filter });

    return {
      data: categories,
      total,
    };
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.categoryModel.create(dto);
  }

  async removeCategory(id: string) {
    return this.categoryModel.findOneAndDelete({ _id: id });
  }

  async updateCategory(id: string, dto: CreateCategoryDto) {
    return this.categoryModel.findOneAndUpdate({ _id: id }, dto, { new: true });
  }
}
