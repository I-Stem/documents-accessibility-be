const Module = require('../../models/learning-module.model');
const Course = require('../../models/learning-course.model');
const Section = require('../../models/learning-section.model')
const mongoose=require('mongoose')

exports.createModule = async (req, res) => {
  try {
    const { title, courseId, moduleNo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Invalid courseId' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const module = await Module.create({ title, courseId, moduleNo });

    res.status(201).json(module);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create module' });
  }
};

exports.getAllModules = async (req, res) => {
  try {
    const modules = await Module.find();
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve modules' });
  }
};

exports.getModulesByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const modules = await Module.find({ course: courseId }).populate('sections');
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve modules' });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, courseId } = req.body;
    const module = await Module.findByIdAndUpdate(id, { title, courseId }, { new: true });
    if (module) {
      res.status(200).json(module);
    } else {
      res.status(404).json({ error: 'Module not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update module' });
  }
};

// Delete a module
exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const module = await Module.findByIdAndDelete(id);
    if (module) {
      // Remove module reference from associated course
      const course = await Course.findById(module.courseId);
      course.modules = course.modules.filter(moduleId => moduleId.toString() !== module._id.toString());
      await course.save();

      // Delete associated sections
      await Section.deleteMany({ moduleId: module._id });

      res.status(200).json({ message: 'Module deleted successfully' });
    } else {
      res.status(404).json({ error: 'Module not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete module' });
  }
};

// Get all the sections for a module
exports.getModuleSections = async (req, res) => {
  try {
      const { moduleId } = req.params;
      const sections = await Section.find({ moduleId }).populate('moduleId', 'title');
      const sectionData = sections.map(section => ({
          _id: section._id,
          sectionNo:section.sectionNo,
          title: section.title
      }));
      res.status(200).json(sectionData);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve sections' });
  }
};