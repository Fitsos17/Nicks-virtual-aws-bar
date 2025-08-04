const { BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");
const docClient = require("../helpers/ddbClient");
const { createResponse } = require("../helpers/createResponse");

exports.handler = async (event) => {
  const items = [
    {
      id: 1,
      name: "Smoky Maple Old Fashioned 🍁",
      ingredients: "Bourbon, maple syrup, bitters, smoked cinnamon stick",
      description:
        "A sophisticated twist on a classic, perfect for cool evenings and cozy conversations.",
      type: "cocktail",
    },
    {
      id: 2,
      name: "Lavender Gin Fizz 🌿",
      ingredients:
        "Gin, lavender syrup, lemon juice, soda water, fresh lavender sprig",
      description:
        "Refreshing and aromatic, this floral cocktail will transport you to a fragrant garden.",
      type: "cocktail",
    },
    {
      id: 3,
      name: "Spiced Rum Punch 🍍",
      ingredients:
        "Spiced rum, pineapple juice, orange juice, grenadine, nutmeg",
      description:
        "A tropical vacation in a glass, bursting with fruity flavors and a hint of spice.",
      type: "cocktail",
    },
    {
      id: 4,
      name: "Whiskey Sour 🥃",
      ingredients:
        "Bourbon whiskey, lemon juice, simple syrup, egg white, cherry",
      description:
        "A timeless classic with the perfect balance of sweet and sour, topped with a silky foam.",
      type: "whiskey",
    },
    {
      id: 5,
      name: "Espresso Martini ☕",
      ingredients: "Vodka, coffee liqueur, fresh espresso, simple syrup",
      description:
        "The ultimate pick-me-up cocktail, blending rich coffee flavors with a vodka kick.",
      type: "cocktail",
    },
    {
      id: 6,
      name: "Barrel-Aged Manhattan 🥃",
      ingredients: "Rye whiskey, sweet vermouth, bitters, luxardo cherry",
      description:
        "A sophisticated sipper with deep, complex flavors enhanced by barrel aging.",
      type: "whiskey",
    },
    {
      id: 7,
      name: "Cucumber Mint Mojito 🥒",
      ingredients:
        "White rum, fresh mint, cucumber, lime juice, simple syrup, soda water",
      description:
        "A crisp and refreshing twist on the classic mojito, perfect for hot summer days.",
      type: "cocktail",
    },
    {
      id: 8,
      name: "Smoked Peach Margarita 🍑",
      ingredients:
        "Tequila, fresh peach puree, lime juice, agave nectar, smoked salt rim",
      description:
        "Sweet, smoky, and tangy, this unique margarita offers a delightful flavor journey.",
      type: "cocktail",
    },
    {
      id: 9,
      name: "Bourbon Pecan Old Fashioned 🥜",
      ingredients: "Bourbon, pecan-infused simple syrup, bitters, orange peel",
      description:
        "A nutty twist on the classic, perfect for bourbon lovers seeking something unique.",
      type: "bourbon",
    },
    {
      id: 10,
      name: "The Nebula 🌌",
      ingredients:
        "Vodka, blue curacao, lemon juice, simple syrup, edible shimmer dust",
      description:
        "Our dazzling special cocktail that sparkles like the night sky, a true visual and taste sensation.",
      type: "special",
    },
  ];

  // only 10 items will be imported, so no worries for the limit batch 25
  try {
    const command = new BatchWriteCommand({
      RequestItems: {
        catalog: items.map((item) => ({
          PutRequest: {
            Item: item,
          },
        })),
      },
    });

    await docClient.send(command);
    return createResponse("200", "Updated catalog succesfully!");
  } catch (error) {
    console.error(`An error occured: ${error}`);
  }
};
