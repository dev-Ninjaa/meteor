import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { QueryMarketplaceDto } from './dto/query-marketplace.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List open tasks with pagination, search, and filters' })
  @ApiResponse({ status: 200, description: 'Paginated marketplace listing' })
  async findAll(@Query() query: QueryMarketplaceDto) {
    return this.marketplaceService.findAll(query);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search open tasks with full-text search' })
  @ApiQuery({ name: 'search', required: true, description: 'Search query (title/description)' })
  @ApiResponse({ status: 200, description: 'Paginated search results' })
  async search(@Query() query: QueryMarketplaceDto) {
    return this.marketplaceService.findAll(query);
  }

  @Get('tags')
  @Public()
  @ApiOperation({ summary: 'Get all unique tags from open tasks' })
  @ApiResponse({ status: 200, description: 'List of unique tags' })
  async getTags(): Promise<string[]> {
    return this.marketplaceService.getTags();
  }
}
