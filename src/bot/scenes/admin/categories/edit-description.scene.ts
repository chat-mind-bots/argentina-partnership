import { Scene } from 'nestjs-telegraf';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from 'src/common/filtres/telegraf-exeption.filter';
import { CategoriesService } from 'src/categories/categories.service';

@Scene('editCategoryDescriptionScene')
@UseFilters(TelegrafExceptionFilter)
export class editCategoryDescriptionScene {
  constructor(
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}
}
