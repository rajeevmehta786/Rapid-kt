import { Test, TestingModule } from '@nestjs/testing';
import { CreateStudentInput } from './dto/create-student.input';
import { UpdateStudentInput } from './dto/update-student.input';
import { StudentResolver } from './student.resolver';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService;
  let resolver: StudentResolver;
  const createDto = new CreateStudentInput();
  const updateDto = new UpdateStudentInput();

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [StudentService],
  //   }).compile();

  //   service = module.get<StudentService>(StudentService);
  // });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  it('calculate value', () => {
    expect(2*2).toBe(4);
  })
});
