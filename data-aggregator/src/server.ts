import express from "express";
import cors from "cors";
import universitiesRouter from "./routes/universities.routes.js";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/", universitiesRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`📊 Data Aggregator running on http://localhost:${PORT}`);
});