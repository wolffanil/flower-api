const app = require("./index.js");
const connectToDatabase = require("./config/dbConnect.js");

connectToDatabase();

const port = process.env.PORT || 6000;
app.listen(port, () => {
  console.log(`server working on port ${port}`);
});
