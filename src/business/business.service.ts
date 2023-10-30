import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Business, BusinessDocument } from 'src/business/business.schema';
import { Model, Types } from 'mongoose';
import { CreateBusinessDto } from 'src/business/dto/create-business.dto';
import { User } from 'src/user/user.schema';
import { Category } from 'src/categories/ctegories.schema';
import { UserService } from 'src/user/user.service';
import { CategoriesService } from 'src/categories/categories.service';
import { UpdateBusinessDto } from 'src/business/dto/update-business.dto';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { File } from 'src/file/file.schema';
import { GetBusinessDto } from 'src/business/dto/query/get-business.dto';
import { StatusEnum } from 'src/business/enum/status.enum';

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

  async create(userId: number, dto: CreateBusinessDto) {
    const user = await this.userService.findByTgId(userId);
    if (!user.role.includes(UserRoleEnum.PARTNER)) {
      throw new HttpException('User not partner', HttpStatus.NOT_ACCEPTABLE);
    }

    return this.businessModel.create({
      owner: user._id,
      category: new Types.ObjectId(dto.categoryId),
      ...dto,
      preview: dto.preview ? new Types.ObjectId(dto.preview) : undefined,
    });
  }

  async findAllBusinessesByOwnerId(
    ownerId: Types.ObjectId,
    params: GetBusinessDto,
  ) {
    const data = await this.businessModel
      .find({ owner: ownerId })
      .populate<{ owner: Pick<User, 'username' | 'first_name' | 'tg_id'> }>({
        path: 'owner',
        select: 'username first_name tg_id',
      })
      .populate<{ category: Pick<Category, 'title' | 'description'> }>({
        path: 'category',
        select: 'title description',
      })
      .limit(params.limit)
      .skip(params.offset);

    const total = await this.businessModel.countDocuments({ owner: ownerId });
    return { data, total };
  }

  async disableAllOwnerBusinesses(ownerId: string) {
    const result = await this.businessModel.updateMany(
      { owner: new Types.ObjectId(ownerId) },
      { $set: { status: StatusEnum.DISABLED } },
    );
    return result;
  }

  async enableAllOwnerBusinesses(ownerId: string) {
    const result = await this.businessModel.updateMany(
      { owner: new Types.ObjectId(ownerId) },
      { $set: { status: StatusEnum.ACTIVE } },
    );
    return result;
  }

  async findCategory(categoryName: string) {
    const category = await this.categoryService.findCategoryByTitle(
      categoryName,
    );
    return category;
  }

  async updateBusiness(
    userId: number,
    businessId: string,
    dto: UpdateBusinessDto,
  ) {
    const user = await this.userService.findByTgId(userId);
    const business = await this.findBusinessById(businessId);

    if (!user.role.includes(UserRoleEnum.PARTNER)) {
      throw new HttpException(
        "You're not allowed to use this method",
        HttpStatus.FORBIDDEN,
      );
    }

    if (business.owner.tg_id !== user.tg_id) {
      throw new HttpException(
        "You're not allowed to use this method",
        HttpStatus.FORBIDDEN,
      );
    }
    return this.businessModel.findOneAndUpdate(
      { _id: businessId },
      {
        ...dto,
        preview: new Types.ObjectId(dto.preview),
        category: new Types.ObjectId(dto.categoryId),
      },
      {
        new: true,
      },
    );
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
      })
      .populate<{ preview: Pick<File, 'bucket' | 'key' | 'domain'> }>({
        path: 'preview',
        select: 'bucket key domain',
      });
  }

  async findBusinessByIdClear(id: string) {
    return this.businessModel.findOne({ _id: id });
  }

  async getBusinesses(params: GetBusinessDto) {
    const filter = {};
    const sort = {};
    if (params.q) {
      filter['$or'] = [{ title: { $regex: params.q, $options: 'i' } }];
    }
    if (params['has-owner']) {
      filter['owner'] = [{ owner: { role: { $in: [UserRoleEnum.PARTNER] } } }];
    }
    if (params.category) {
      filter['category'] = new Types.ObjectId(params.category);
    }
    if (params.status) {
      filter['status'] = params.status;
    }

    if (params['sort-by']) {
      sort[params['sort-by']] = params['sort-order'] === 'asc' ? 1 : -1;
    }

    const businesses = await this.businessModel
      .find({ ...filter })
      .limit(params.limit)
      .skip(params.offset)
      .sort({ ...sort })
      .populate<{ owner: Pick<User, 'role'> }>({
        path: 'owner',
        select: 'role',
      })
      .populate<{ category: Pick<Category, 'title' | 'description'> }>({
        path: 'category',
        select: 'title',
      })
      .populate<{ preview: Pick<File, 'bucket' | 'key' | 'domain'> }>({
        path: 'preview',
        select: 'bucket key domain',
      })
      .lean()
      .exec();
    const total = await this.businessModel.countDocuments({ ...filter }).exec();

    return {
      data: businesses,
      total,
    };
  }
}
