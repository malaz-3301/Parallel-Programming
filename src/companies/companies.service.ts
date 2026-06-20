import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { UserType } from 'src/enums/enums';
import { User } from 'src/users/entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const { userId, ...companyData } = createCompanyDto;
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: userId, userType: Not(UserType.BANNED) },
    });

    if (!user) {
      throw new NotFoundException('Company owner was not found');
    }

    if (await this.findOneByUser(userId)) {
      throw new ConflictException('The user already owns a company');
    }

    const company = this.companyRepository.create({
      ...companyData,
      userId,
    });
    return this.companyRepository.save(company);
  }

  findAll() {
    return this.companyRepository.find({
      where: { userId: Not(IsNull()) },
    });
  }

  findOne(id: number) {
    return this.companyRepository.findOne({
      where: { id, userId: Not(IsNull()) },
    });
  }

  findOneByUser(userId: number) {
    return this.companyRepository.findOne({ where: { userId } });
  }

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
    actorId: number,
    actorType: UserType,
  ) {
    const where =
      actorType === UserType.ADMIN || actorType === UserType.SUPERADMIN
        ? { id }
        : { id, userId: actorId };
    const result = await this.companyRepository.update(where, updateCompanyDto);

    if (result.affected !== 1) {
      throw new NotFoundException();
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.companyRepository.update(
      { id, userId: Not(IsNull()) },
      { userId: null },
    );

    if (result.affected !== 1) {
      throw new NotFoundException();
    }

    return { id, detached: true };
  }
}
