import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from 'src/categories/ctegories.schema';
import { CreateCategoryDto } from 'src/categories/dto/create-category.dto';

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
    const category = await this.categoryModel.findOne({ _id: id });
    if (!category) {
      throw new HttpException(
        'Document (Category) not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return category;
  }

  async findAllCategories() {
    return this.categoryModel.find();
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.categoryModel.create(dto);
  }

  async removeCategory(id: string) {
    return this.categoryModel.findOneAndDelete({ _id: id });
  }

  async updateCategory(id: string, dto: CreateCategoryDto) {
    return this.categoryModel.findOneAndUpdate({ id }, dto, { new: true });
  }
}
