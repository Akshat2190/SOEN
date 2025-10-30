import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js'; // Import the connect function from db.js
import userRoutes from './routes/user.routes.js'; // Import user routes
import projectRoutes from './routes/project.routes.js'; // Import project routes
import aiRoutes from './routes/ai.routes.js'; // Import AI routes
import cookieParser from 'cookie-parser';
import cors from 'cors';
connect(); // Call the connect function to establish a database connection

const app = express();

app.use(cors())
app.use(morgan('dev')); // Logging middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Middleware to parse cookies

app.use('/users', userRoutes); // Use user routes
app.use('/projects', projectRoutes); // Use project routes
app.use('/ai',aiRoutes )// Use AI routes



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).json({ error: err.message });
});


export default app;