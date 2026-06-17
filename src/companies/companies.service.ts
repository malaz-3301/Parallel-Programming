import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class CompaniesService {
  constructor(@InjectRepository(Company) private companyRepository: Repository<Company>,) { }
  create(createCompanyDto: CreateCompanyDto, user_id: number) {
    console.log("dkfjklajl")
    const company = this.companyRepository.create({ ...createCompanyDto, user: { id: user_id } });
    return this.companyRepository.save(company)
  }

  findAll() {
    return this.companyRepository.find({ where: { user: { id: Not(IsNull()) } } });
  }

  findOne(id: number) {
    return this.companyRepository.findOne({ where: { id, user: { id: Not(IsNull()) } } })
  }
  findOneByUser(user_id: number, ) {
    const where = { where: { user: { id: user_id } } }
    return this.companyRepository.findOne(where)
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return this.companyRepository.update(id, updateCompanyDto);
  }
  updateForUser(id: number, updateCompanyDto: UpdateCompanyDto, user_id: number) {
    return this.companyRepository.update({ id, user: { id: user_id } }, updateCompanyDto,);
  }

  remove(id: number) {
    return this.companyRepository.update(id, { user: { id: undefined } })
  }
}
