const { createBatchWriteCommand } = require("./helpers/createCommands");
const {
  handleReturningOfUpdateFunctions,
} = require("./helpers/handleErrorsAndReturning");

exports.handler = async (event) => {
  const items = [
    {
      id: 1,
      name: "Old Fashioned 🥃",
      ingredients: "Bourbon, sugar cube, Angostura bitters, orange twist",
      description: "A timeless bourbon classic with a smooth, rich finish.",
      type: "bourbon",
      price: 12,
    },
    {
      id: 2,
      name: "Whiskey Sour 🍋",
      ingredients: "Whiskey, lemon juice, simple syrup, egg white",
      description: "Crisp, tangy, and velvety—perfect for any occasion.",
      type: "whiskey",
      price: 11,
    },
    {
      id: 3,
      name: "Negroni 🍊",
      ingredients: "Gin, Campari, sweet vermouth",
      description: "A bittersweet Italian favorite with a punch of citrus.",
      type: "cocktail",
      price: 11,
    },
    {
      id: 4,
      name: "Mint Julep 🌿",
      ingredients: "Bourbon, mint leaves, sugar, crushed ice",
      description: "Cool, minty, and irresistibly Southern.",
      type: "bourbon",
      price: 10,
    },
    {
      id: 5,
      name: "Mojito 🍃",
      ingredients: "White rum, mint, lime juice, sugar, soda water",
      description: "Light, refreshing, and full of tropical zest.",
      type: "cocktail",
      price: 9,
    },
    {
      id: 6,
      name: "Manhattan 🍒",
      ingredients: "Rye whiskey, sweet vermouth, bitters, cherry",
      description: "Elegant and bold, with a sweet cherry finish.",
      type: "whiskey",
      price: 12,
    },
    {
      id: 7,
      name: "Boulevardier 🧡",
      ingredients: "Bourbon, Campari, sweet vermouth",
      description: "A bourbon-lover’s twist on the Negroni—bitter and bold.",
      type: "bourbon",
      price: 12,
    },
    {
      id: 8,
      name: "Cosmopolitan 🍸",
      ingredients: "Vodka, triple sec, cranberry juice, lime juice",
      description: "Stylish and fruity with a tart citrus edge.",
      type: "cocktail",
      price: 10,
    },
    {
      id: 9,
      name: "Irish Coffee ☕️",
      ingredients: "Irish whiskey, hot coffee, sugar, cream",
      description: "Warm, boozy, and topped with silky cream.",
      type: "whiskey",
      price: 11,
    },
    {
      id: 10,
      name: "Inferno Blaze 🔥",
      ingredients: "Smoked bourbon, cinnamon syrup, chili bitters, orange peel",
      description: "Our signature special—fiery, smoky, and unforgettable.",
      type: "special",
      price: 15,
    },
  ];

  // only 10 items will be imported, so no worries for the limit batch 25
  try {
    await createBatchWriteCommand("Catalog", items);
    return handleReturningOfUpdateFunctions(200, "Catalog");
  } catch (error) {
    return handleReturningOfUpdateFunctions(500, "Catalog", error);
  }
};
