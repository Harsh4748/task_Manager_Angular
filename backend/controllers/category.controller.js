const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
  try {
    // ✅ Return ALL categories (global) — every user sees every category
    const categories = await Category.find({}).sort({ name: 1 });
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // ✅ Global duplicate check — no two categories with same name across ANY user
    const existing = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({ 
      name, 
      userId: req.user.id 
    });

    // ✅ Emit socket event so all connected users refresh their category list
    if (req.io) {
      req.io.emit("categoryUpdated");
    }

    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding category" });
  }
};
