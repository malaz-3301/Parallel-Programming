import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Roles } from 'src/auth/utils/roles.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }
  @Roles(['admin'])
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @Request() req: { user: User }) {
    return this.companiesService.create(createCompanyDto, req.user.id);
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
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto,) {
    return this.companiesService.update(+id, updateCompanyDto,);
  }
  @Patch(':id')
  updateForUser(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @Request() req: { user: User }) {
    return this.companiesService.updateForUser(+id, updateCompanyDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(+id);
  }
}
