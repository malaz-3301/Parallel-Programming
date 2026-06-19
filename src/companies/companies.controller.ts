import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Roles } from 'src/auth/utils/roles.decorator';
import { UserType } from 'src/users/utils/user-type';
import { CompaniesService } from './companies.service';
import { CompanyJob } from './companies.process';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    @InjectQueue('company') private readonly companyQueue: Queue<CompanyJob>,
  ) {}

  @Roles(UserType.ADMIN)
  @Post()
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.companyQueue.add('create', {
      ...createCompanyDto,
      user_id: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

  @Roles(UserType.ADMIN)
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const job = await this.companyQueue.add('update', {
      ...updateCompanyDto,
      id: +id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Patch(':id')
  updateForUser(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.companiesService.updateForUser(
      +id,
      updateCompanyDto,
      user.id,
    );
  }

  @Roles(UserType.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const job = await this.companyQueue.add('remove', { id: +id });
    return { status: 'queued', jobId: job.id };
  }
}
