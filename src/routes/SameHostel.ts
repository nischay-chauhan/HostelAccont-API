// Define a middleware function
const checkHostelNumber = (req, res, next) => {
    // Get the hostel number of the authenticated incharge from the request object
    const inchargeHostelNumber = req.user.hostelNumber; // Assuming the hostel number is stored in req.user
  
    // Get the hostel number of the student from the request parameters
    const { studentId } = req.params;
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
    });
  
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
  
    const studentHostelNumber = student.hostelNumber;
  
    // Check if the hostel numbers match
    if (inchargeHostelNumber !== studentHostelNumber) {
      return res.status(403).json({ message: "Incharge does not have access to this student's hostel" });
    }
  
    // If the hostel numbers match, proceed to the next middleware or route handler
    next();
  };
  
  module.exports = checkHostelNumber;
  