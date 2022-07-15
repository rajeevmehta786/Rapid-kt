import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateStudentInput } from './dto/create-student.input';
import { UpdateStudentInput } from './dto/update-student.input';
import { Student } from './entities/student.entity';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService; // get service type
  const createDto = new CreateStudentInput(); // get create dto.
  const updateDto = new UpdateStudentInput(); // get update dto.

  createDto.name = 'rajeev';
  createDto.email = 'rajeevmehta@fortude.co';
  createDto.dob = '1994-09-12T18:30:00.000Z';

  updateDto.id = 'dummy-id';
  updateDto.name = 'rajeev';
  updateDto.email = 'rajeevmehta@fortude.co';
  updateDto.dob = '1994-09-12T18:30:00.000Z';

  const studentRecords = [
    {
      id: 'dummy-id',
      name: 'rajeev',
      email: 'rajeevmehta@fortude.co',
      dob: '1994-09-12T18:30:00.000Z'
    },
    {
      id: 'dummy-id-2',
      name: 'Geo',
      email: 'geo@email.com',
      dob: '1997-06-04T18:30:00.000Z',
    },
  ]

  let studentRepo = {
    create: jest.fn().mockImplementation((payload) => { return payload }),
    save: jest.fn().mockImplementation(() => {
      return {
        id: 'dummy-id',
        ...createDto
      }
    }),
    delete: jest.fn().mockImplementation((id: any) => { return { affected: 1 } }),
    findAll: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn((skip?, take?) => {return studentRecords }),
    findOneBy: jest.fn()
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentService, {
        provide: getRepositoryToken(Student),
        useValue: studentRepo
      }],
    }).compile();

    service = module.get<StudentService>(StudentService);
  });

  it('### Service should be defined ###', () => {
    expect(service).toBeDefined();
  });

  it('### Repository should be defined ###', () => {
    expect(studentRepo).toBeDefined();
  });

  it('### A new student record should be created ###', async () => {
    expect(await service.createStudent(createDto)).toEqual({
      id: 'dummy-id',
      ...createDto
    })
  })

  it('### A student record should be found ###', async () => {
    const studentObj = {
      id: 'dummy-id',
      name: 'rajeev',
      email: 'rajeevmehta@fortude.co',
      dob: '1994-09-12T18:30:00.000Z'
    }
    studentRepo.findOneBy.mockReturnValue(studentObj);
    const foundObj = await service.findStudentById(studentObj.id);
    expect(foundObj).toEqual(studentObj);
    expect(foundObj).toMatchObject(studentObj);
  });

  it('### A student record should be not found ###', async () => {
    const studentObj = {
      id: 'dummy-',
      name: 'rajeev',
      email: 'rajeevmehta@fortude.co',
      dob: '1994-09-12T18:30:00.000Z'
    }
    studentRepo.findOneBy.mockReturnValue(new NotFoundException(`Record cannot find by id ${studentObj.id}}`));
    const foundObj = await service.findStudentById(studentObj.id);
    expect(foundObj).toHaveProperty('status', 404);
  });

  it('### A student record should be updated ###', async () => {
    const updatedStudent = service.updateStudentRecord('dummy-id', updateDto);
    expect(updatedStudent).toEqual(updateDto);
  })

  it('### A student record should be deleted ###', async () => {
    const studentObj = {
      id: 'dummy-id',
      name: 'rajeev',
      email: 'rajeevmehta@fortude.co',
      dob: '1994-09-12T18:30:00.000Z'
    }
    studentRepo.findOneBy.mockReturnValue(studentObj);
    const result = await service.removeStudentRecord('dummy-id');
    expect(result).toEqual(updateDto);
  })

  it('### All records should be found ###', async () => {
    const skip = 0;
    const take = 5;
    const result = await service.findAllStudents(skip, take);
    expect(result).toContainEqual({
      id: 'dummy-id-2',
      name: 'Geo',
      email: 'geo@email.com',
      dob: '1997-06-04T18:30:00.000Z',
    })
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'dummy-id',
          name: 'rajeev',
          email: 'rajeevmehta@fortude.co',
          dob: '1994-09-12T18:30:00.000Z'
        })
      ])
    );
  });

  it('### Total count should be returned ###' , async () => {
    const length = await service.getTotalCounts();
    expect(length).toBe(studentRecords.length);
  })

  it ('### Age should be calculated ###' , () => {
    const calculatedAge = service.getStudentAge(createDto.dob);
    expect(calculatedAge).toBe(27);
  } )
});
