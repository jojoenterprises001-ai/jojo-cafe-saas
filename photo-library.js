// ===== JOJO CAFE - READYMADE PHOTO LIBRARY =====
// Free stock photos, categorized. Owner selects from this list when adding menu items.

const PHOTO_LIBRARY = [
  // Beverages
  { name: "Coffee", category: "Beverages", url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop" },
  { name: "Cold Coffee", category: "Beverages", url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop" },
  { name: "Cappuccino", category: "Beverages", url: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=300&h=300&fit=crop" },
  { name: "Tea", category: "Beverages", url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop" },
  { name: "Milkshake", category: "Beverages", url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=300&fit=crop" },
  { name: "Cold Drink", category: "Beverages", url: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=300&fit=crop" },
  { name: "Lemonade", category: "Beverages", url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=300&h=300&fit=crop" },
  { name: "Mojito", category: "Beverages", url: "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=300&h=300&fit=crop" },
  { name: "Smoothie", category: "Beverages", url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=300&fit=crop" },
  { name: "Fresh Juice", category: "Beverages", url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=300&fit=crop" },

  // Fast Food
  { name: "Burger", category: "Fast Food", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop" },
  { name: "Cheese Burger", category: "Fast Food", url: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300&h=300&fit=crop" },
  { name: "Sandwich", category: "Fast Food", url: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=300&fit=crop" },
  { name: "Grilled Sandwich", category: "Fast Food", url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&h=300&fit=crop" },
  { name: "Hot Dog", category: "Fast Food", url: "https://images.unsplash.com/photo-1612392062631-94dd858cba88?w=300&h=300&fit=crop" },
  { name: "Wrap", category: "Fast Food", url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&h=300&fit=crop" },
  { name: "Club Sandwich", category: "Fast Food", url: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=300&h=300&fit=crop" },

  // Main Course
  { name: "Pizza", category: "Main Course", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop" },
  { name: "Pasta", category: "Main Course", url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&h=300&fit=crop" },
  { name: "Noodles", category: "Main Course", url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=300&fit=crop" },
  { name: "Fried Rice", category: "Main Course", url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop" },
  { name: "Biryani", category: "Main Course", url: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=300&h=300&fit=crop" },
  { name: "Momos", category: "Main Course", url: "https://images.unsplash.com/photo-1626777553635-be322f229166?w=300&h=300&fit=crop" },
  { name: "Thali", category: "Main Course", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=300&fit=crop" },
  { name: "Paratha", category: "Main Course", url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=300&fit=crop" },

  // Snacks
  { name: "French Fries", category: "Snacks", url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=300&fit=crop" },
  { name: "Nachos", category: "Snacks", url: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300&h=300&fit=crop" },
  { name: "Spring Roll", category: "Snacks", url: "https://images.unsplash.com/photo-1548507200-1cebbd68cc41?w=300&h=300&fit=crop" },
  { name: "Samosa", category: "Snacks", url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=300&fit=crop" },
  { name: "Garlic Bread", category: "Snacks", url: "https://images.unsplash.com/photo-1573140401552-3fab0b24427f?w=300&h=300&fit=crop" },
  { name: "Chicken Wings", category: "Snacks", url: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=300&h=300&fit=crop" },
  { name: "Popcorn", category: "Snacks", url: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300&h=300&fit=crop" },

  // Desserts
  { name: "Pastry", category: "Desserts", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop" },
  { name: "Brownie", category: "Desserts", url: "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=300&h=300&fit=crop" },
  { name: "Ice Cream", category: "Desserts", url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&h=300&fit=crop" },
  { name: "Donut", category: "Desserts", url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop" },
  { name: "Cheesecake", category: "Desserts", url: "https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=300&h=300&fit=crop" },
  { name: "Waffle", category: "Desserts", url: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=300&h=300&fit=crop" },
  { name: "Chocolate Cake", category: "Desserts", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop" },
  { name: "Muffin", category: "Desserts", url: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300&h=300&fit=crop" },

  // Healthy
  { name: "Salad", category: "Healthy", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop" },
  { name: "Soup", category: "Healthy", url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=300&fit=crop" },
  { name: "Fruit Bowl", category: "Healthy", url: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=300&h=300&fit=crop" },
  { name: "Sprouts Salad", category: "Healthy", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=300&fit=crop" },

  // Indian Specials
  { name: "Dosa", category: "Indian Special", url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&h=300&fit=crop" },
  { name: "Idli", category: "Indian Special", url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&h=300&fit=crop" },
  { name: "Vada Pav", category: "Indian Special", url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&h=300&fit=crop" },
  { name: "Pav Bhaji", category: "Indian Special", url: "https://images.unsplash.com/photo-1626132647523-66c6bb08b3f2?w=300&h=300&fit=crop" },
  { name: "Chole Bhature", category: "Indian Special", url: "https://images.unsplash.com/photo-1626777553635-be322f229166?w=300&h=300&fit=crop" }
];
