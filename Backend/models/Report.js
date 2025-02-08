const mongoose=require('mongoose')
const ReportSchema = new mongoose.Schema({
    name: String,
    mobilePhone: String,
    pan: String,
    creditScore: Number,
    reportSummary: {
      totalAccounts: Number,
      activeAccounts: Number,
      closedAccounts: Number,
      currentBalance: Number,
      securedAmount: Number,
      unsecuredAmount: Number,
      last7DaysEnquiries: Number,
    },
    creditAccounts: [
      {
        creditCard: String,
        bank: String,
        address: String,
        accountNumber: String,
        amountOverdue: Number,
        currentBalance: Number,
      },
    ],
  });
  const Reportmodel = mongoose.model("Report", ReportSchema);
  module.exports=Reportmodel