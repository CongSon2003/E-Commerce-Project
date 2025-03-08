const { default : mongoose } = require('mongoose');
mongoose.set('strictQuery', false)
const dbConnect = async () => {
  try {
    const toConnect = await mongoose.connect(process.env.MONGODB_URI);
    if (toConnect.connection.readyState === 1) {
      console.log("Connection has been established successfully ✅");
    } else {
      console.log("Untale to connect to the database 📴");
    }
  } catch (error) {
    console.log("Untale to connect to the database 📴");
    throw new Error(error)
  }
}

module.exports = dbConnect