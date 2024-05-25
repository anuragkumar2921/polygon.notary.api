require('dotenv').config()
require('express-async-errors')

//cron jobs
// require('./crons/billGeneration')

//express
const express = require('express')
const app = express()

//middleware
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const fileUpload = require('express-fileupload');
const logger = require('./middleware/logger')
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
app.use(express.json())
app.use(fileUpload())
app.use(logger)
app.use(helmet());
app.use(cors({origin: '*'}))
app.use(xss());

// Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//routers
const lawFirmRouter = require('./routes/lawfirmRoutes')
const clientRouter = require('./routes/clientRoutes')
const copyrightRouter = require('./routes/copyrightRoutes')
const trademarkRouter = require('./routes/trademarkRoutes')
const commonRouter = require('./routes/commonRoutes')
const billRouter = require('./routes/billRoutes')

//routes
app.use('/api/v1/polygon/lawfirm', lawFirmRouter)
app.use('/api/v1/polygon/client', clientRouter)
app.use('/api/v1/polygon/copyright', copyrightRouter)
app.use('/api/v1/polygon/trademark', trademarkRouter)
app.use('/api/v1/polygon/bill', billRouter)
app.use('/api/v1/polygon', commonRouter)

app.use(errorHandlerMiddleware)
app.use(notFoundMiddleware)

// start server
const connectDB = require('./configs/dbConfig');
const port = process.env.PORT || 5555;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
}

start();