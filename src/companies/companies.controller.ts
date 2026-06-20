import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Roles } from 'src/auth/utils/roles.decorator';
import { UserType } from 'src/enums/enums';
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
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    const job = await this.companyQueue.add('create', createCompanyDto);
    return { status: 'queued', jobId: job.id };
  }

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() actor: JwtPayload,
  ) {
    const job = await this.companyQueue.add('update', {
      ...updateCompanyDto,
      id,
      actorId: actor.id,
      actorType: actor.userType,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Roles(UserType.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const job = await this.companyQueue.add('remove', { id });
    return { status: 'queued', jobId: job.id };
  }
}
