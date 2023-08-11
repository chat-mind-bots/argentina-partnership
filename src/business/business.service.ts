import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Business, BusinessDocument } from 'src/business/business.schema';
import { Model } from 'mongoose';
import { CreateBusinessDto } from 'src/business/dto/create-business.dto';
import { User } from 'src/user/user.schema';
import { Category } from 'src/categories/ctegories.schema';
import { UserService } from 'src/user/user.service';
import { CategoriesService } from 'src/categories/categories.service';

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
      owner: ownerId,
      category: categoryId,
      ...dto,
    });

    return result;
  }

  async findAllBusinessesByOwnerId(ownerId: string) {
    const result = await this.businessModel
      .find({ owner: ownerId })
      .populate<{ user: Pick<User, 'username' | 'first_name' | 'tg_id'> }>({
        path: 'user',
        select: 'username first_name tg_id',
      })
      .populate<{ user: Pick<Category, 'title' | 'description'> }>({
        path: 'category',
        select: 'title description',
      }); //check this expression for the second condition
    return result;
  }

  async findPartnerByTgId(id: number) {
    return await this.userService.findByTgId(id);
  }

  async isCategoryExist(categoryId: string): Promise<boolean> {
    const category = await this.categoryService.findById(categoryId);
    if (!category) {
      return false;
    }
    return true;
  }
}
