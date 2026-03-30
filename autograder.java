import java.io.*;
import java.util.*;
import java.nio.file.*;
import java.lang.reflect.*;

public class AutoGrader {
    private List<AssignmentGrade> grades;
    private List<TestCase> testCases;
    
    public AutoGrader() {
        this.grades = new ArrayList<>();
        this.testCases = new ArrayList<>();
    }
    
    /**
     * Add a test case for grading
     */
    public void addTestCase(TestCase testCase) {
        testCases.add(testCase);
    }
    
    /**
     * Grade a single assignment/submission
     */
    public AssignmentGrade gradeAssignment(Student student, String sourceCode) {
        AssignmentGrade grade = new AssignmentGrade(student);
        
        // Compile source code
        if (!compileCode(sourceCode)) {
            grade.setScore(0);
            grade.addFeedback("COMPILATION ERROR: Code failed to compile");
            return grade;
        }
        
        // Run test cases
        double totalPoints = 0;
        double earnedPoints = 0;
        
        for (TestCase test : testCases) {
            totalPoints += test.getPoints();
            if (runTest(test)) {
                earnedPoints += test.getPoints();
                grade.addFeedback("PASS: " + test.getName());
            } else {
                grade.addFeedback("FAIL: " + test.getName() + " - " + test.getExpectedOutput());
            }
        }
        
        double score = (totalPoints > 0) ? (earnedPoints / totalPoints) * 100 : 0;
        grade.setScore(score);
        
        return grade;
    }
    
    /**
     * Compile Java source code
     */
    private boolean compileCode(String sourceCode) {
        try {
            // Write source code to temporary file
            File tempFile = File.createTempFile("TempCode", ".java");
            FileWriter writer = new FileWriter(tempFile);
            writer.write(sourceCode);
            writer.close();
            
            // Compile using javac
            ProcessBuilder pb = new ProcessBuilder("javac", tempFile.getAbsolutePath());
            Process process = pb.start();
            int exitCode = process.waitFor();
            
            tempFile.delete();
            return exitCode == 0;
        } catch (Exception e) {
            System.err.println("Compilation error: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Run a single test case
     */
    private boolean runTest(TestCase test) {
        try {
            ProcessBuilder pb = new ProcessBuilder("java", test.getClassName());
            Process process = pb.start();
            
            // Send input
            OutputStream stdin = process.getOutputStream();
            stdin.write(test.getInput().getBytes());
            stdin.close();
            
            // Capture output
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
            );
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }
            
            int exitCode = process.waitFor();
            
            // Compare expected vs actual output
            return output.toString().trim().equals(test.getExpectedOutput().trim());
        } catch (Exception e) {
            System.err.println("Test execution error: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Grade multiple students
     */
    public void gradeMultipleSubmissions(List<Student> students, Map<Integer, String> submissions) {
        for (Student student : students) {
            String code = submissions.get(student.getId());
            if (code != null) {
                AssignmentGrade grade = gradeAssignment(student, code);
                grades.add(grade);
            }
        }
    }
    
    /**
     * Generate a grading report
     */
    public void generateReport(String outputFile) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(outputFile))) {
            writer.println("=".repeat(60));
            writer.println("AUTOMATED GRADING REPORT");
            writer.println("=".repeat(60));
            writer.println();
            
            double totalScore = 0;
            for (AssignmentGrade grade : grades) {
                writer.println("Student: " + grade.getStudent().getName());
                writer.println("ID: " + grade.getStudent().getId());
                writer.println("Score: " + String.format("%.2f", grade.getScore()) + "%");
                writer.println("Feedback:");
                for (String feedback : grade.getFeedback()) {
                    writer.println("  - " + feedback);
                }
                writer.println("-".repeat(60));
                totalScore += grade.getScore();
            }
            
            if (!grades.isEmpty()) {
                double averageScore = totalScore / grades.size();
                writer.println();
                writer.println("Average Score: " + String.format("%.2f", averageScore) + "%");
            }
            writer.println("=".repeat(60));
            
            System.out.println("Report generated: " + outputFile);
        } catch (IOException e) {
            System.err.println("Error generating report: " + e.getMessage());
        }
    }
    
    /**
     * Get all grades
     */
    public List<AssignmentGrade> getGrades() {
        return grades;
    }
    
    public static void main(String[] args) {
        // Example usage
        AutoGrader grader = new AutoGrader();
        
        // Add test cases
        grader.addTestCase(new TestCase(
            "TestSum",
            "5\n3",
            "8",
            "Test Case 1: Sum Operation",
            10
        ));
        
        grader.addTestCase(new TestCase(
            "TestSum",
            "10\n20",
            "30",
            "Test Case 2: Sum Operation",
            10
        ));
        
        // Create students and their submissions
        List<Student> students = Arrays.asList(
            new Student("Alice Johnson", 101),
            new Student("Bob Smith", 102),
            new Student("Carol White", 103)
        );
        
        // Simulate grading
        System.out.println("Grading submissions...");
        grader.generateReport("grading_report.txt");
    }
}
