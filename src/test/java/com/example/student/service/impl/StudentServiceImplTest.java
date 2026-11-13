package com.example.student.service.impl;

import com.example.student.dto.*;
import com.example.student.exception.EntityNotFoundException;
import com.example.student.mapper.StudentMapper;
import com.example.student.model.Student;
import com.example.student.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceImplTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private StudentMapper studentMapper;

    @InjectMocks
    private StudentServiceImpl studentService;

    // Тестит успешное создание студента
    @Test
    void save_ShouldReturnStudentResponse() {
        StudentRequest request = new StudentRequest();
        request.setName("Ivan");
        Student student = new Student();
        student.setId(1L);
        student.setName("Ivan");
        StudentResponse expectedResponse = new StudentResponse(1L, "Ivan", "Ivanov");

        when(studentMapper.requestToStudent(request)).thenReturn(student);
        when(studentRepository.save(student)).thenReturn(student);
        when(studentMapper.studentToResponse(student)).thenReturn(expectedResponse);
        StudentResponse actualResponse = studentService.save(request);
        assertNotNull(actualResponse);
        assertEquals(1L, actualResponse.getId());
        assertEquals("Ivan", actualResponse.getName());
        verify(studentRepository, times(1)).save(student);
    }

    // Проверяет успешный поиск студента по id
    @Test
    void findById_WhenExists_ShouldReturnStudentFullResponse() {
        Long id = 1L;
        Student student = new Student();
        student.setId(id);

        StudentFullResponse expectedResponse = new StudentFullResponse();
        expectedResponse.setId(id);
        when(studentRepository.findById(id)).thenReturn(Optional.of(student));
        when(studentMapper.studentToFullResponse(student)).thenReturn(expectedResponse);
        StudentFullResponse actualResponse = studentService.findById(id);
        assertNotNull(actualResponse);
        assertEquals(id, actualResponse.getId());
    }

    // Тестит обработку ошибки
    @Test
    void findById_WhenNotExists_ShouldThrowException() {
        Long id = 99L;
        when(studentRepository.findById(id)).thenReturn(Optional.empty());
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> studentService.findById(id)
        );

        assertTrue(exception.getMessage().contains("Student with ID 99 not found"));
        verify(studentMapper, never()).studentToFullResponse(any());
    }

    // Проверяет получение списка всех студентов
    @Test
    void findAll_ShouldReturnList() {
        List<Student> students = List.of(new Student(), new Student());
        StudentResponseList expectedList = new StudentResponseList(List.of(), 0);

        when(studentRepository.findAll()).thenReturn(students);
        when(studentMapper.studentListToStudentResponseList(students)).thenReturn(expectedList);
        StudentResponseList actualList = studentService.findAll();
        assertNotNull(actualList);
        assertEquals(expectedList, actualList);
    }

    // Позитивно ждет успешного обновления данных студента
    @Test
    void update_WhenExists_ShouldUpdateFields() {
        Long id = 1L;
        Student existedStudent = new Student();
        existedStudent.setId(id);
        existedStudent.setPhoneNumber("old");
        existedStudent.setEmail("old@mail.com");

        StudentUpdateRequest updateRequest = new StudentUpdateRequest();
        updateRequest.setPhoneNumber("new");
        updateRequest.setEmail("new@mail.com");

        StudentResponse expectedResponse = new StudentResponse();

        when(studentRepository.findById(id)).thenReturn(Optional.of(existedStudent));
        when(studentRepository.save(any(Student.class))).thenReturn(existedStudent);
        when(studentMapper.studentToResponse(existedStudent)).thenReturn(expectedResponse);
        StudentResponse actualResponse = studentService.update(id, updateRequest);
        assertNotNull(actualResponse);
        assertEquals("new", existedStudent.getPhoneNumber());
        assertEquals("new@mail.com", existedStudent.getEmail());
    }

    // Оплакивает удаление студента
    @Test
    void deleteById_ShouldCallRepository() {
        studentService.deleteById(1L);
        verify(studentRepository, times(1)).deleteById(1L);
    }

    // Единичное обновление
    @Test
    void update_WhenFieldsAreNull_ShouldNotUpdateThem() {
        Long id = 1L;
        Student existedStudent = new Student();
        existedStudent.setId(id);
        existedStudent.setPhoneNumber("oldPhone");
        existedStudent.setEmail("oldEmail@mail.com");

        StudentUpdateRequest updateRequest = new StudentUpdateRequest();
        when(studentRepository.findById(id)).thenReturn(Optional.of(existedStudent));
        when(studentRepository.save(any(Student.class))).thenReturn(existedStudent);
        when(studentMapper.studentToResponse(existedStudent)).thenReturn(new StudentResponse());
        studentService.update(id, updateRequest);
        assertEquals("oldPhone", existedStudent.getPhoneNumber()); // Не изменилось
        assertEquals("oldEmail@mail.com", existedStudent.getEmail()); // Не изменилось
    }
}