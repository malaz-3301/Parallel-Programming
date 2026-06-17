import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Roles } from 'src/auth/utils/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobType } from './companies.process';
import { RolesGuard } from 'src/auth/utils/roles.guard';
@UseGuards(RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService, @InjectQueue('company') private companyQueue: Queue<JobType>) { }
  @Roles(['admin'])
  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto, @Request() req: { user: User }) {
    await this.companyQueue.add('create', { ...createCompanyDto, user_id: req.user.id });
  }
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }
  @Roles(['admin'])
  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto,) {
    await this.companyQueue.add('create', { ...updateCompanyDto, id: +id });
  }
  @Patch(':id')
  updateForUser(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @Request() req: { user: User }) {
    return this.companiesService.updateForUser(+id, updateCompanyDto, req.user.id);
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.companyQueue.add('create', { id: +id });
  }
}
