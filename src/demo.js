require("dotenv").config();

const fs = require("fs");
const path = require("path");

const app = require("express")();

const Axios = require("axios");

const indexTemplate = fs
  .readFileSync(path.resolve(__dirname, "index.html"))
  .toString("utf-8");

const resultTemplate = fs
  .readFileSync(path.resolve(__dirname, "result.html"))
  .toString("utf-8");

async function homePage(req, res) {
  const userId = req.query.userId;

  if (userId === undefined || userId === "") {
    return res.send("userId is required");
  }

  const jsResponse = await Axios.post(
    `${process.env.HOST}/auth/account/association/generate_web3connect_button_js`,
    {
      api_key_secret: process.env.API_KEY_SECRET,
      redirect_url: "http://localhost:23456/result?userId=" + userId,
    }
  );

  const script = jsResponse.data.result;

  res.send(
    indexTemplate
      .replace("/** HERE_WEB3CONNECT_HERE */", script)
      .replace("%user_id%", req.query.userId)
  );
}

async function resultPage(req, res) {
  res.send(
    resultTemplate
      .replace("%user_id%", req.query.userId)
      .replace("%id_wallet_address%", req.query.id_wallet_address)
  );
}

app.get("/", homePage);

app.get("/index.html", homePage);

app.get("/index", homePage);

app.get("/result", resultPage);

app.listen(23456);
