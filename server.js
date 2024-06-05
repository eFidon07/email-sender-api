import express from "express";
import { config } from "dotenv";
import logger from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import ip from "ip";
import { mailer } from "./src/index.js";
import axios from "axios";

config();
const app = express();

app.set("trust proxy", true);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(cookieParser());

app.use((req, _, next) => {
  console.log(req.path, req.method);
  next();
});

app.get("/", async (req, res) => {
  return res.status(200).json("Welcome to Mail sender API!");
});

app.post("/api/v1/mail/send", async (req, res) => {
  const { mailAuthentication, mailFrom, mailTo, subject, text, html } =
    req.body;

  const ipAddress = ip.address();
  const result = await axios.get(`https://ipapi.co/json/`);

  const { region, country_name } = result.data;

  if (
    !mailAuthentication.email ||
    !mailAuthentication.pass ||
    !mailFrom ||
    !mailTo ||
    !subject ||
    !text ||
    !html
  )
    return res
      .status(404)
      .json({ status: "fail", message: "Missing required fields!" });

  const transporter = mailer(mailAuthentication);

  let newHtml;
  if (req.body.sentFrom && req.body.sentFrom === "you-vote") {
    newHtml =
      html +
      `<p><b>Ip address:</b> ${ipAddress}</p><br/><p>Thanks for using You-Vote by <b>coderX001</b></p>`;
  } else newHtml = html;

  // Response from mail sending
  const response = await transporter.sendMail({
    html: newHtml,
    mailFrom,
    mailTo,
    subject,
    text,
  });

  const responseStatus = response.status === "fail" ? 500 : 200;
  return res
    .status(responseStatus)
    .json({ status: response.status, message: response.message });
});

app.listen(3000, () => {
  console.log("Server running on PORT 3000...");
});
