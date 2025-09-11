/**********************************************
 * USE THIS ONLY WHEN YOU FINISH THE PROJECT **
 *    TO NOT ADD ADDITIONAL COSTS FROM AI    **
 **********************************************
 */

const {
  handleReturningOfUpdateFunctions,
} = require("/opt/handleErrorsAndReturning");
const { sendInvokeClientCommand } = require("/opt/sendCommands");

exports.handler = async (event) => {
  const prompt = `Generate a JSON array of seating objects for a bar. Each object has: id, number_of_seats (1 to max per type), type (bar stool, table, sunbed), tableType (only if type is table), comments (describe the seat) and taken (false). I want: 5 <= number of bar stools <= 10; 4 <= number of sunbeds <= 7; 10 tables Generate plain text, no JSON wrapper and additional textes`;
  try {
    const results = await sendInvokeClientCommand(prompt);
    const seats = results["seating"];

    await createBatchWriteCommand("Catalog", seats);
    return handleReturningOfUpdateFunctions(200, "Catalog");
  } catch (err) {
    return handleReturningOfUpdateFunctions(500, "Catalog", err);
  }
};
