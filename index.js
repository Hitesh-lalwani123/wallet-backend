const express = require('express');
const mainRouter = require('./routes');
const app = express();
const cors = require('cors')

app.use(express.json());
app.use(cors());
app.use('/api/v1',mainRouter);
app.get('/',(req,res)=>{
    res.send({
        message: "Service working"
    })
})
app.listen(3000);