import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsQueryDto } from './dto/products-query.dto';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('brands')
  listBrands() {
    return this.productsService.listBrands();
  }

  @Get('categories')
  listCategories() {
    return this.productsService.listCategories();
  }

  @Get('products')
  listProducts(@Query() query: ProductsQueryDto) {
    return this.productsService.listProducts(query);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.productsService.getProduct(id);
  }

  @Get('products/:id/related')
  related(@Param('id') id: string) {
    return this.productsService.getRelatedProducts(id);
  }
}
