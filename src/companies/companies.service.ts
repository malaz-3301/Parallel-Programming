import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CompaniesService {
  constructor(@InjectRepository(Company) private companyRepository: Repository<Company>,) { }
  create(createCompanyDto: CreateCompanyDto) {
    const company = this.companyRepository.create(createCompanyDto);
    return this.companyRepository.save(company)
  }

  findAll() {
    return this.companyRepository.find();
  }

  findOne(id: number) {
    return this.companyRepository.findOne({ where: { id } })
  }
  findOneByUser(user_id: number) {
    return this.companyRepository.findOne({ where: { user: { id: user_id } } })
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return this.companyRepository.update(id, updateCompanyDto);
  }

  remove(id: number) {
    return this.companyRepository.delete(id)
  }
}
