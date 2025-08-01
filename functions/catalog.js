exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      special: {
        id: 1,
        name: "🌟 Starlight Sensation",
        ingredients:
          "Vodka, blue curaçao, lemon juice, simple syrup, edible glitter",
        description:
          "A dazzling, shimmering cocktail that will transport you to a magical realm with every sip.",
      },
      drinks: [
        {
          id: 2,
          name: "🍹 Tropical Paradise",
          ingredients: "Rum, coconut cream, pineapple juice, orange juice",
          description:
            "Escape to a sun-soaked beach with this refreshing and fruity concoction.",
        },
        {
          id: 3,
          name: "🍎 Crisp Apple Martini",
          ingredients: "Vodka, apple schnapps, apple juice, lemon juice",
          description:
            "A tart and sweet cocktail that captures the essence of biting into a fresh apple.",
        },
        {
          id: 4,
          name: "🌶️ Spicy Margarita",
          ingredients: "Tequila, lime juice, agave syrup, jalapeño slices",
          description:
            "A zesty twist on the classic margarita that will awaken your taste buds.",
        },
        {
          id: 5,
          name: "🍓 Berry Bliss",
          ingredients:
            "Gin, strawberry puree, lemon juice, simple syrup, soda water",
          description:
            "A light and fruity drink that's perfect for sipping on a warm summer evening.",
        },
        {
          id: 6,
          name: "☕ Espresso Martini",
          ingredients: "Vodka, coffee liqueur, fresh espresso, simple syrup",
          description:
            "The ultimate pick-me-up cocktail, combining the best of coffee and alcohol.",
        },
        {
          id: 7,
          name: "🥒 Cucumber Cooler",
          ingredients: "Gin, cucumber, lime juice, mint leaves, tonic water",
          description:
            "A refreshing and crisp drink that's like a spa day in a glass.",
        },
        {
          id: 8,
          name: "🍊 Whiskey Sunrise",
          ingredients: "Whiskey, orange juice, grenadine",
          description:
            "A smooth and colorful cocktail that's perfect for whiskey lovers looking for a fruity twist.",
        },
        {
          id: 9,
          name: "🍇 Lavender Lemonade",
          ingredients: "Vodka, lemon juice, lavender syrup, soda water",
          description:
            "A fragrant and soothing cocktail that combines floral notes with zesty lemon.",
        },
        {
          id: 10,
          name: "🥥 Coconut Mojito",
          ingredients:
            "Coconut rum, lime juice, coconut cream, mint leaves, soda water",
          description:
            "A tropical take on the classic mojito that will transport you to a Caribbean paradise.",
        },
        {
          id: 11,
          name: "🍑 Peach Bellini",
          ingredients: "Prosecco, peach puree",
          description:
            "An elegant and bubbly cocktail that's perfect for celebrations or brunch.",
        },
      ],
    }),
  };
};
