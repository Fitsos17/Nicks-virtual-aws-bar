/**********************************************
 * USE THIS ONLY WHEN YOU FINISH THE PROJECT **
 *    TO NOT ADD ADDITIONAL COSTS FROM AI    **
 **********************************************
 */
const { sendInvokeClientCommand } = require("/opt/sendCommands");
const {
  handleReturningOfUpdateFunctions,
} = require("/opt/handleErrorsAndReturning");

exports.handler = async () => {
  const prompt = `Generate a plain text JSON array of 10 drink objects with the structure: {id, name, ingredients, description, type, price}. Each drink must have a unique id, an emoji after the name, ingredients as a single string, an enticing description, and a type (whiskey, cocktail, burbon), with one being "special". Include prices. Use a plain text, no json wrapper and additional text`;

  try {
    const results = await sendInvokeClientCommand(prompt);
    const drinks = results["drinks"];

    await createBatchWriteCommand("Catalog", drinks);
    return handleReturningOfUpdateFunctions(200, "Catalog");
  } catch (err) {
    return handleReturningOfUpdateFunctions(500, "Catalog", err);
  }
};
