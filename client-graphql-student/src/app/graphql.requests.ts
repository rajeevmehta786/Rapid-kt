import { gql } from 'apollo-angular';

export const GET_STUDENTS = gql`
  query GetStudentData($limit: Int, $offset: Int) {
    getAllStudents(limit: $limit, offset: $offset) {
      id
      name
      age
      dob
      email
      totalCount
    }
  }
`;

export const GET_STUDENT = gql`
  query GetStudentByID($studentId: Int!) {
    getStudentById(id: $studentId) {
      id
      name
      age
      dob
      email
    }
  }
`;

export const GET_STUDENT_BY_ID = gql`
  query GetStudentByID($studentId: Int!) {
    getStudentById(id: $studentId) {
      id
      name
      age
      dob
      email
    }
  }
`;

export const CREATE_STUDENT = gql`
  mutation CreateStudent($passedValue: CreateStudentInput!) {
    createStudent(createStudentInput: $passedValue) {
      id
      name
      age
      dob
      email
    }
  }
`;

export const UPDATE_STUDENT = gql`
  mutation UpdateStudent($passedValue: UpdateStudentInput!) {
    updateStudent(updateStudentInput: $passedValue) {
      id
      name
      age
      dob
      email
    }
  }
`;

export const REMOVE_STUDENT = gql`
  mutation RemoveStudent($studentId: String!) {
    removeStudent(id: $studentId) {
      id
    }
  }
`;
