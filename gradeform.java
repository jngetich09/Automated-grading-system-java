import java.util.*;

public class GradeForm {
    private String studentName;
    private double score;
    private String grade;
    
    // Constructor
    public GradeForm(String studentName, double score) {
        this.studentName = studentName;
        this.score = score;
        this.grade = calculateGrade(score);
    }
    
    // Calculate grade based on score
    private String calculateGrade(double score) {
        if (score >= 90) {
            return "A";
        } else if (score >= 80) {
            return "B";
        } else if (score >= 70) {
            return "C";
        } else if (score >= 60) {
            return "D";
        } else {
            return "F";
        }
    }
    
    // Display grade information
    public void displayGrade() {
        System.out.println("==============================");
        System.out.println("GRADE REPORT");
        System.out.println("==============================");
        System.out.println("Student Name: " + studentName);
        System.out.println("Score: " + score);
        System.out.println("Grade: " + grade);
        System.out.println("==============================");
    }
    
    // Getters
    public String getStudentName() {
        return studentName;
    }
    
    public double getScore() {
        return score;
    }
    
    public String getGrade() {
        return grade;
    }
    
    // Main method for testing
    public static void main(String[] args) {
        // Create grade form instances
        GradeForm student1 = new GradeForm("John Doe", 85);
        GradeForm student2 = new GradeForm("Jane Smith", 92);
        GradeForm student3 = new GradeForm("Bob Johnson", 75);
        
        // Display grades
        student1.displayGrade();
        student2.displayGrade();
        student3.displayGrade();
    }
}
