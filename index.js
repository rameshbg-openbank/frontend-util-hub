// Set Process ENV variables
require("dotenv").config();

const http = require("http");
const express = require("express");
const RED = require("node-red");
const path = require("path");
const cors = require("cors");

const fileRoutes = require("./routes/pdf");

// Create an Express app
var app = express();

app.use(cors());

app.use(express.json());

app.options("*", cors());

app.use("/file", fileRoutes);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (_, res) {
  res.render("index", {
    flowsPath: process.env.FLOWS_PATH,
  });
});

// Create a server
const server = http.createServer(app);

// Create the settings object - see default settings.js file for other options
const redFlowsSettings = {
  httpAdminRoot: process.env.FLOWS_PATH || "/red",
  httpNodeRoot: process.env.FLOWS_API_PATH || "/api",
  userDir: "./.nodered/",
  functionGlobalContext: {}, // enables global context
  adminAuth: {
    type: "credentials",
    users: [
      {
        username: process.env.FLOWS_ADMIN_USERNAME,
        password: process.env.FLOWS_ADMIN_PASSWORD,
        permissions: "*",
      },
    ],
  },
};

// Initialize the runtime with a server and settings
RED.init(server, redFlowsSettings);

// Serve the editor UI from /red
app.use(redFlowsSettings.httpAdminRoot, RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(redFlowsSettings.httpNodeRoot, RED.httpNode);

server.listen(process.env.PORT || 4444);

// Start the runtime
RED.start();
