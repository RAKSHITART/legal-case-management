const express=require("express");
const router=express.Router();

const{
downloadCaseReport
}=require("../controllers/reportController");

router.get(
"/case/:id",
downloadCaseReport
);

module.exports=router;