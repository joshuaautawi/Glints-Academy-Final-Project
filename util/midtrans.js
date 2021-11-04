const midtrans = require("midtrans-client");
require("dotenv").config({ path: "./config/config.env" });


const midtransSnap = new midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER,
  clientKey: process.env.MIDTRANS_CLIENT,
});

module.exports = { midtransSnap };
