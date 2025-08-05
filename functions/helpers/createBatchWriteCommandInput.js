/* The BatchWrite command must have an input object as a parameter.
    The input object must look like this:
    {
      RequestItems: {
        {tableName}: {itamsArray}.map((item) => ({
          PutRequest: {
            Item: item,
          },
        })),
      },
    }
*/

exports.createBatchWriteCommandInput = (tableName, items) => {
  return {
    RequestItems: {
      [tableName]: items.map((item) => ({
        PutRequest: {
          Item: item,
        },
      })),
    },
  };
};
