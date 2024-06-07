const Section = require('../../models/learning-section.model');
const Module = require('../../models/learning-module.model');
// const marked = require('marked'); // Import the Markdown library

// Create a new section
// exports.createSection = async (req, res) => {
//     try {
//         const { title, sectionNo, content, moduleId } = req.body;
//         const module = await Module.findById(moduleId);
//         if (!module) {
//             return res.status(404).json({ error: 'Module not found' });
//         }
//         const section = await Section.create({ title, sectionNo, content, moduleId });
//         res.status(201).json(section);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to create section' });
//     }
// };


exports.createSection = async (req, res) => {
    try {
      const { title, sectionNo, content, moduleId } = req.body;
      const module = await Module.findById(moduleId);
      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }
  
      const section = await Section.create({ title, sectionNo, content, moduleId });
  
      // Push the section's ID into the module's sections array
      module.sections.push(section._id);
      await module.save();
  
      res.status(201).json(section);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create section' });
    }
  };
  

// Get all sections with populated module title
exports.getAllSections = async (req, res) => {
    try {
        const { moduleId } = req.body;
        const sections = await Section.find({ moduleId }).populate('moduleId', 'title');
        const sectionData = sections.map(section => ({
            id: section._id,
            sectionNo:section.sectionNo,
            title: section.title
        }));
        res.status(200).json(sectionData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve sections' });
    }
};




// Get a section by ID with populated module title
exports.getSectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const section = await Section.findById(id).populate('moduleId', 'title');
        if (section) {
            res.status(200).json(section);
        } else {
            res.status(404).json({ error: 'Section not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve section' });
    }
};

// Update a section
exports.updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, moduleId } = req.body;
        const section = await Section.findByIdAndUpdate(id, { content, moduleId }, { new: true });
        if (section) {
            res.status(200).json(section);
        } else {
            res.status(404).json({ error: 'Section not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update section' });
    }
};

// Delete a section
exports.deleteSection = async (req, res) => {
    try {
        const { id } = req.params;
        const section = await Section.findByIdAndDelete(id);
        if (section) {
            res.status(200).json({ message: 'Section deleted successfully' });
        } else {
            res.status(404).json({ error: 'Section not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete section' });
    }
};


