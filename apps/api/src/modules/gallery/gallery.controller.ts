import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePhotoDto, UpdatePhotoDto, GalleryQueryDto } from '@mss/shared';

@ApiTags('gallery')
@Controller({ path: 'gallery', version: '1' })
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  // ── Public endpoints ─────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List published photos with filtering & pagination' })
  findAll(@Query() query: GalleryQueryDto) {
    return this.galleryService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured photos for the home scene' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findFeatured(@Query('limit') limit?: number) {
    return this.galleryService.findFeatured(limit);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get category list with photo counts' })
  getCategories() {
    return this.galleryService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single photo by ID' })
  findOne(@Param('id') id: string) {
    return this.galleryService.findById(id);
  }

  // ── Admin-only endpoints ─────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new photo entry (admin only)' })
  create(@Body() dto: CreatePhotoDto) {
    return this.galleryService.create(dto);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk update photo sort order' })
  reorder(@Body() updates: { id: string; sortOrder: number }[]) {
    return this.galleryService.bulkUpdateOrder(updates);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update photo metadata' })
  update(@Param('id') id: string, @Body() dto: UpdatePhotoDto) {
    return this.galleryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a photo' })
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
