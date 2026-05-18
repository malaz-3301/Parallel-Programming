import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Roles } from 'src/auth/utils/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobType } from './companies.process';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService, @InjectQueue('company') private companyQueue: Queue<JobType>) { }
  @Roles(['admin'])
  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto, @Request() req: { user: User }) {
    // return this.companiesService.create(createCompanyDto, req.user.id);
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
    // return this.companiesService.update(+id, updateCompanyDto,);
    await this.companyQueue.add('create', {...updateCompanyDto, id: +id});
  }
  @Patch(':id')
  updateForUser(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @Request() req: { user: User }) {
    return this.companiesService.updateForUser(+id, updateCompanyDto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // return this.companiesService.remove(+id);
    await this.companyQueue.add('create', {id: +id});
  }
}
