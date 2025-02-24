require("dotenv").config();
const { error } = require("console");
const express = require("express");
const mongoose = require("mongoose");
const { resolve } = require("path");

const app = express();
const port = 3010;

app.use(express.static("static"));
app.use(express.json());


//MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error in MongoDB connection:", err));

//MenuItem schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
});

const menuItem = mongoose.model("MenuItem", menuItemSchema);

//Routes

//POST ( Adding a new menu Item)
app.post("/menu", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || price == null)
      return res.status(400).json({ error: "Name and price are required" });
    const newItem = new menuItem({ name, description, price });
    await newItem.save();
    res
      .status(201)
      .json({ message: "Menu item added successfully", item: newItem });
  } catch (error) {
    res.status(500).json({ error: "Error adding menu item", error });
  }
});

//PUT(updating a curent menu item)
app.put("/menu/:id", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const updatedItem = await menuItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price },
      { new: true, runValidators: true }
    );
    if (!updatedItem)
      return res.status(404).json({ error: "Menu item not found" });
    res.json({ message: "Menu item updated successfully", item: updatedItem });
  } catch (error) {
    res.status(500).json({ error: "Error updating menu item" });
  }
});

//Delete
app.delete("/menu/:id", async (req, res) => {
  try {
    const deleteItem = await menuItem.findByIdAndDelete(req.params.id);
    if (!deleteItem)
      return res.status(404).json({ error: "Menu item not found" });
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting menu item" });
  }
});

// GET (fetching all menu items)
app.get("/menu", async (req, res) => {
  try {
    const AllItems = await menuItem.find();
    res.json(AllItems);
  } catch (error) {
    res.status(500).json({ error: "Error fetching menu items" });
  }
  // res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
