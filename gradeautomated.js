// Grade Form Component - Automated Grading System
// Handles form submission, validation, and grade calculation

class GradeForm {
  constructor(formId = 'gradeForm') {
    this.form = document.getElementById(formId);
    this.students = [];
    this.grades = {};
    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    this.loadStudents();
  }

  // Load students from storage or API
  async loadStudents() {
    try {
      const response = await fetch('/api/students');
      this.students = await response.json();
      this.renderStudentOptions();
    } catch (error) {
      console.error('Error loading students:', error);
      this.students = JSON.parse(localStorage.getItem('students')) || [];
    }
  }

  // Render student dropdown options
  renderStudentOptions() {
    const select = this.form?.querySelector('select[name="studentId"]');
    if (!select) return;

    select.innerHTML = '<option value="">Select a student...</option>';
    this.students.forEach(student => {
      const option = document.createElement('option');
      option.value = student.id;
      option.textContent = `${student.name} (${student.id})`;
      select.appendChild(option);
    });
  }

  // Handle form submission
  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const studentId = formData.get('studentId');
    const assignment = formData.get('assignment');
    const score = parseFloat(formData.get('score'));
    const maxScore = parseFloat(formData.get('maxScore')) || 100;
    const feedback = formData.get('feedback');

    // Validation
    if (!this.validateForm(studentId, assignment, score, maxScore)) {
      return;
    }

    // Calculate percentage
    const percentage = (score / maxScore) * 100;
    const grade = this.calculateGrade(percentage);

    const gradeRecord = {
      studentId,
      assignment,
      score,
      maxScore,
      percentage: percentage.toFixed(2),
      grade,
      feedback,
      timestamp: new Date().toISOString()
    };

    // Save grade
    await this.saveGrade(gradeRecord);
    this.displayResult(gradeRecord);
    this.form.reset();
  }

  // Validate form inputs
  validateForm(studentId, assignment, score, maxScore) {
    const errors = [];

    if (!studentId) {
      errors.push('Please select a student');
    }
    if (!assignment) {
      errors.push('Please enter assignment name');
    }
    if (isNaN(score) || score < 0) {
      errors.push('Score must be a valid positive number');
    }
    if (isNaN(maxScore) || maxScore <= 0) {
      errors.push('Max score must be a valid positive number');
    }
    if (score > maxScore) {
      errors.push('Score cannot exceed max score');
    }

    if (errors.length > 0) {
      this.showError(errors.join('\n'));
      return false;
    }
    return true;
  }

  // Calculate letter grade based on percentage
  calculateGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  // Save grade to storage/API
  async saveGrade(gradeRecord) {
    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gradeRecord)
      });

      if (!response.ok) {
        throw new Error('Failed to save grade');
      }

      // Also save to local storage as backup
      const allGrades = JSON.parse(localStorage.getItem('grades')) || [];
      allGrades.push(gradeRecord);
      localStorage.setItem('grades', JSON.stringify(allGrades));

      return response.json();
    } catch (error) {
      console.error('Error saving grade:', error);
      // Fallback to local storage only
      const allGrades = JSON.parse(localStorage.getItem('grades')) || [];
      allGrades.push(gradeRecord);
      localStorage.setItem('grades', JSON.stringify(allGrades));
    }
  }

  // Display result to user
  displayResult(gradeRecord) {
    const resultDiv = document.getElementById('gradeResult');
    if (!resultDiv) return;

    resultDiv.innerHTML = `
      <div class="grade-result success">
        <h3>Grade Recorded</h3>
        <p><strong>Student:</strong> ${this.getStudentName(gradeRecord.studentId)}</p>
        <p><strong>Assignment:</strong> ${gradeRecord.assignment}</p>
        <p><strong>Score:</strong> ${gradeRecord.score}/${gradeRecord.maxScore}</p>
        <p><strong>Percentage:</strong> ${gradeRecord.percentage}%</p>
        <p><strong>Grade:</strong> <span class="grade-letter">${gradeRecord.grade}</span></p>
        ${gradeRecord.feedback ? `<p><strong>Feedback:</strong> ${gradeRecord.feedback}</p>` : ''}
      </div>
    `;

    resultDiv.style.display = 'block';
    setTimeout(() => {
      resultDiv.style.display = 'none';
    }, 5000);
  }

  // Get student name by ID
  getStudentName(studentId) {
    const student = this.students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
  }

  // Show error message
  showError(message) {
    const errorDiv = document.getElementById('gradeError');
    if (errorDiv) {
      errorDiv.innerHTML = `<div class="error-message">${message}</div>`;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    } else {
      alert('Error: ' + message);
    }
  }

  // Get all grades for a student
  getStudentGrades(studentId) {
    const allGrades = JSON.parse(localStorage.getItem('grades')) || [];
    return allGrades.filter(g => g.studentId === studentId);
  }

  // Calculate average for a student
  calculateStudentAverage(studentId) {
    const grades = this.getStudentGrades(studentId);
    if (grades.length === 0) return 0;

    const totalPercentage = grades.reduce((sum, g) => sum + parseFloat(g.percentage), 0);
    return (totalPercentage / grades.length).toFixed(2);
  }

  // Export grades to CSV
  exportGradesCSV() {
    const allGrades = JSON.parse(localStorage.getItem('grades')) || [];
    let csv = 'Student ID,Student Name,Assignment,Score,Max Score,Percentage,Grade,Feedback,Timestamp\n';

    allGrades.forEach(grade => {
      const studentName = this.getStudentName(grade.studentId);
      csv += `${grade.studentId},"${studentName}","${grade.assignment}",${grade.score},${grade.maxScore},${grade.percentage},${grade.grade},"${grade.feedback}",${grade.timestamp}\n`;
    });

    this.downloadCSV(csv, 'grades.csv');
  }

  // Download CSV file
  downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Clear all grades (with confirmation)
  clearAllGrades() {
    if (confirm('Are you sure you want to clear all grades? This cannot be undone.')) {
      localStorage.removeItem('grades');
      this.showError('All grades have been cleared');
    }
  }
}

// Initialize the grade form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.gradeForm = new GradeForm('gradeForm');
});
