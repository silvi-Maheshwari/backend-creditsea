const express=require('express')
const mongoose = require("mongoose");
const multer = require("multer");
const xml2js = require("xml2js");
const fs = require("fs");
const dotenv = require('dotenv');

dotenv.config();

const uri=process.env.MONGO_URI
const port=process.env.port
console.log(uri)
console.log(port)
const Reportmodel = require('./models/Report');
const app = express();
const cors = require("cors");
app.use(cors());


const connectDb=async()=>{
try{
    const data=await mongoose.connect('mongodb+srv://maheshwarisilvi98:silvi123@cluster0.jftpm.mongodb.net/books?retryWrites=true&w=majority')
    console.log('connected to database')
}catch(err){
    console.log(err)
}
}


// Multer Setup for File Upload
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage });
  
  // XML File Upload Endpoint
  app.post("/upload", upload.single("file"), async (req, res) => {
    try {
      const xmlData = fs.readFileSync(req.file.path, "utf8");
      xml2js.parseString(xmlData, async (err, result) => {
        if (err) return res.status(400).json({ error: "Invalid XML format" });
        
        const extractedData = {
          name: result.CreditReport.Name[0],
          mobilePhone: result.CreditReport.MobilePhone[0],
          pan: result.CreditReport.PAN[0],
          creditScore: parseInt(result.CreditReport.CreditScore[0]),
          reportSummary: {
            totalAccounts: parseInt(result.CreditReport.ReportSummary[0].TotalAccounts[0]),
            activeAccounts: parseInt(result.CreditReport.ReportSummary[0].ActiveAccounts[0]),
            closedAccounts: parseInt(result.CreditReport.ReportSummary[0].ClosedAccounts[0]),
            currentBalance: parseInt(result.CreditReport.ReportSummary[0].CurrentBalance[0]),
            securedAmount: parseInt(result.CreditReport.ReportSummary[0].SecuredAmount[0]),
            unsecuredAmount: parseInt(result.CreditReport.ReportSummary[0].UnsecuredAmount[0]),
            last7DaysEnquiries: parseInt(result.CreditReport.ReportSummary[0].Last7DaysEnquiries[0]),
          },
          creditAccounts: result.CreditReport.CreditAccounts[0].Account.map((acc) => ({
            creditCard: acc.CreditCard[0],
            bank: acc.Bank[0],
            address: acc.Address[0],
            accountNumber: acc.AccountNumber[0],
            amountOverdue: parseInt(acc.AmountOverdue[0]),
            currentBalance: parseInt(acc.CurrentBalance[0]),
          })),
        };
        
        const newReport = new Reportmodel(extractedData);
        await newReport.save();
        res.status(201).json({ message: "File processed successfully", data: extractedData });
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Get Reports API
  app.get("/reports", async (req, res) => {
    try {
      const reports = await Reportmodel.find();
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({ error: "Error fetching reports" });
    }
  });
  

app.listen(7000,()=>{
    connectDb()
    console.log('server is connected')
})
