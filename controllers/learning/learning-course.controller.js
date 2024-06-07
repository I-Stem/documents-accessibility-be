const Course = require('../../models/learning-course.model');

exports.createCourse = async (req, res) => {
    try {
        const { title } = req.body;
        const course = await Course.create({ title });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create course' });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
      console.log("Inside courses")
        const courses = await Course.find();
        console.log(courses)
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve courses' });
    }
};


exports.getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);
        if (course) {
            res.status(200).json(course);
        } else {
            res.status(404).json({ error: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve course' });
    }
};



// exports.updateCourse = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { title } = req.body;
//       const course = await Course.findByIdAndUpdate(id, { title }, { new: true });
//       if (course) {
//         res.status(200).json(course);
//       } else {
//         res.status(404).json({ error: 'Course not found' });
//       }
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to update course' });
//     }
//   };
  
//   // Delete a course
//   exports.deleteCourse = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const course = await Course.findByIdAndDelete(id);
//       if (course) {
//         res.status(200).json({ message: 'Course deleted successfully' });
//       } else {
//         res.status(404).json({ error: 'Course not found' });
//       }
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to delete course' });
//     }
//   };
  