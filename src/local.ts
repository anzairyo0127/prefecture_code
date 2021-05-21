import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./server";

const app = createApp();
const port = 8000;

app.listen(port, ()=> {
  console.log(`http://localhost:${port}`);
});
