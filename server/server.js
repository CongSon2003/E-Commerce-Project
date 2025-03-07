const express = require('express')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 8888
// Middleware để phân tích dữ liệu JSON của client gửi đến server
app.use(express.json())
// Middleware để phân tích dữ liệu URL-encoded, các biểu mẫu HTML (HTML FORMS)
app.use(express.urlencoded({ extended : true })) // "extended: true" : Cho phép bạn gửi các đối tượng và mảng phức tạp, Các đối tượng lồng nhau trong dữ liệu.

// Use Route 
app.use('/', (req, res) => {
  res.send('SERVER RUNNING')
})
app.listen(port, () => {
  console.log(`Server running on the port : ${port}`);
})