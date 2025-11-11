const express = require('express');
const Restaurant = require('../models/Restaurant');
const { authenticateRestaurant } = require('../middleware/auth');

const router = express.Router();

// All routes here require authentication
router.use(authenticateRestaurant);

// Get restaurant's own menu
router.get('/menu', async (req, res) => {
  try {
    console.log('📋 Fetching menu for restaurant:', req.restaurantId);
    const restaurant = await Restaurant.findById(req.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant.menu);
  } catch (error) {
    console.error('❌ Error fetching menu:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add menu item
router.post('/menu', async (req, res) => {
  try {
    console.log('➕ Adding menu item for restaurant:', req.restaurantId);
    console.log('📦 Request body:', req.body);
    
    const restaurant = await Restaurant.findById(req.restaurantId);
    if (!restaurant) {
      console.error('❌ Restaurant not found:', req.restaurantId);
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const newMenuItem = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: req.body.image,
      available: req.body.available !== undefined ? req.body.available : true
    };

    console.log('🍽️ New menu item:', newMenuItem);
    
    restaurant.menu.push(newMenuItem);
    await restaurant.save();

    const addedItem = restaurant.menu[restaurant.menu.length - 1];
    console.log('✅ Menu item added successfully:', addedItem._id);
    res.status(201).json(addedItem);
  } catch (error) {
    console.error('❌ Error adding menu item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update menu item
router.put('/menu/:menuItemId', async (req, res) => {
  try {
    console.log('✏️ Updating menu item:', req.params.menuItemId);
    const restaurant = await Restaurant.findById(req.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menuItem = restaurant.menu.id(req.params.menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (req.body.name !== undefined) menuItem.name = req.body.name;
    if (req.body.description !== undefined) menuItem.description = req.body.description;
    if (req.body.price !== undefined) menuItem.price = req.body.price;
    if (req.body.category !== undefined) menuItem.category = req.body.category;
    if (req.body.image !== undefined) menuItem.image = req.body.image;
    if (req.body.available !== undefined) menuItem.available = req.body.available;

    await restaurant.save();
    console.log('✅ Menu item updated successfully');
    res.json(menuItem);
  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete menu item
router.delete('/menu/:menuItemId', async (req, res) => {
  try {
    console.log('🗑️ Deleting menu item:', req.params.menuItemId);
    const restaurant = await Restaurant.findById(req.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.menu.pull(req.params.menuItemId);
    await restaurant.save();

    console.log('✅ Menu item deleted successfully');
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting menu item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get restaurant stats (for dashboard)
// Get restaurant stats (for dashboard)
router.get('/stats', async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Import Order dynamically to avoid circular dependency
    const Order = require('../models/Order');
    const orders = await Order.find({ restaurant: restaurantId });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o =>
      ['pending', 'preparing', 'confirmed', 'out for delivery'].includes(o.status)
    ).length;

    const todayStr = new Date().toDateString();
    const todayOrders = orders.filter(
      o => new Date(o.createdAt).toDateString() === todayStr
    );
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const stats = {
      totalOrders,
      pendingOrders,
      todayRevenue,
      totalMenuItems: restaurant.menu.length
    };

    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ message: error.message });
  }
});


// Get restaurant's orders (placeholder for now)
router.get('/orders', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update restaurant profile
router.put('/profile', async (req, res) => {
  try {
    const { password, email, ...updateData } = req.body;
    
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.restaurantId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;