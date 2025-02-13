import app from "./app";
import mongoose from "mongoose";
import { MONGO_URI, PORT } from "@/constants/env";

const port = PORT;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log("Server running on port: " + port);
    });
  })
  .catch(console.error);
