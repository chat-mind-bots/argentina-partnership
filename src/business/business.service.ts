import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Business, BusinessDocument } from 'src/business/business.schema';
import { Model, Types } from 'mongoose';
import { CreateBusinessDto } from 'src/business/dto/create-business.dto';
import { User } from 'src/user/user.schema';
import { Category } from 'src/categories/ctegories.schema';
import { UserService } from 'src/user/user.service';
import { CategoriesService } from 'src/categories/categories.service';
import { UpdateBusinessDto } from 'src/business/dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoryService: CategoriesService,
  ) {}

  async create(ownerId: string, categoryId: string, dto: CreateBusinessDto) {
    const result = await this.businessModel.create({
      owner: new Types.ObjectId(ownerId),
      category: new Types.ObjectId(categoryId),
      ...dto,
      preview: new Types.ObjectId(dto.preview),
    });

    return result;
  }

  async findAllBusinessesByOwnerId(ownerId: Types.ObjectId) {
    const result = await this.businessModel
      .find({ owner: ownerId })
      .populate<{ owner: Pick<User, 'username' | 'first_name' | 'tg_id'> }>({
        path: 'owner',
        select: 'username first_name tg_id',
      })
      .populate<{ category: Pick<Category, 'title' | 'description'> }>({
        path: 'category',
        select: 'title description',
      }); //check this expression for the second condition
    return result;
  }

  async findPartnerByTgId(id: number) {
    return await this.userService.findByTgId(id);
  }

  async findCategory(categoryName: string) {
    const category = await this.categoryService.findCategoryByTitle(
      categoryName,
    );
    return category;
  }

  async updateBusiness(id: string, dto: UpdateBusinessDto) {
    return this.businessModel.findOneAndUpdate({ _id: id }, dto, { new: true });
  }

  async findBusinessById(id: string) {
    return this.businessModel
      .findOne({ _id: id })
      .populate<{ owner: Pick<User, 'username' | 'first_name' | 'tg_id'> }>({
        path: 'owner',
        select: 'username first_name tg_id',
      })
      .populate<{ category: Pick<Category, 'title' | 'description'> }>({
        path: 'category',
        select: 'title description',
      });
  }

  async findBusinessByIdClear(id: string) {
    return this.businessModel.findOne({ _id: id });
  }
}
