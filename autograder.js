class Student {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.assignments = {};
    }

    addAssignment(name, score) {
        this.assignments[name] = score;
    }

    getAverage() {
        const scores = Object.values(this.assignments);
        const total = scores.reduce((acc, score) => acc + score, 0);
        return total / scores.length;
    }
}

class Assignment {
    constructor(name, maxScore) {
        this.name = name;
        this.maxScore = maxScore;
    }
}

class GradingSystem {
    constructor() {
        this.students = {};
    }

    addStudent(name, id) {
        const student = new Student(name, id);
        this.students[id] = student;
    }

    addAssignmentToStudent(id, assignmentName, score) {
        if (this.students[id]) {
            this.students[id].addAssignment(assignmentName, score);
        } else {
            console.log('Student not found.');
        }
    }

    calculateGrades() {
        const grades = {};
        for (const id in this.students) {
            grades[id] = this.students[id].getAverage();
        }
        return grades;
    }

    report() {
        const grades = this.calculateGrades();
        console.log('Grade Report:');
        for (const id in grades) {
            console.log(`Student ${id}: Average Score = ${grades[id]}`);
        }
    }
}

// Example Usage
const gradingSystem = new GradingSystem();
gradingSystem.addStudent('John Doe', '101');
gradingSystem.addAssignmentToStudent('101', 'Math', 85);
gratingSystem.addAssignmentToStudent('101', 'Science', 90);

gradingSystem.report();