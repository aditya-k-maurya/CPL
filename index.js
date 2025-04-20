import express from 'express'
import appRouter from './routes/routes.js'
import cors from 'cors'

const app = express();
const port = 3000

app.use(cors());

// middleware to get json data and we can also set the limit
app.use(express.json({ limit: "16kb" }));

// we can also get data from the url so to handle than we use middleware name urlencoded
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use('/',appRouter);

app.listen(port, () => {
  console.log(`app is listening on port ${port}`)
})