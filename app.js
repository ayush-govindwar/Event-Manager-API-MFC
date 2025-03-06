require('dotenv').config();
//express
const express = require("express");
const app = express();

//rest of the packages
const cors = require('cors');
const cookieParser = require("cookie-parser");
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');

//database
const connectDB = require('./db/connect');

//router
const authRouter = require('./routes/authRoutes');
const eventRouter = require('./routes/eventRoutes');


//middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

//avoid DDos attacks
app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);


app.use(express.json());
app.use(cors());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(helmet());
app.use(xss());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/event', eventRouter);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
