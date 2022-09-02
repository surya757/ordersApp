const express = require('express')
const util = require('util')
const mysql=require('mysql')
var app=express();
let connection  = mysql.createConnection({
    host: process.env.HOST_NAME,
    user:  process.env.USER,
    password: process.env.PASS
});

const query = util.promisify(connection.query).bind(connection);
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methos', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});
app.use(express.json());


//NEW ORDER CREATION

app.post('/orders/create', async (req, res) => {

    try{

    //DUPLICATE RECORD CHECK
    const checkDuplicateOrderQuery = "select order_id from orders where order_id=?"
    let checkDuplicateOrderResult = await query(checkDuplicateOrderQuery, [req.body.order_id])
    if(checkDuplicateOrderResult.length){
      res.send({inserted:false,error:true,duplicate:true,message:"category name already exists"})
    }else{
        //NEW ORDER CREATION
        const createOrderQuery = `insert into orders(order_id,item_name,cost,order_date,delivery_date) values(?,?,?,?,?)`
        const creationResult = await query(createOrderQuery,[req.body.order_id, req.body.item_name, req.body.cost, req.body.order_date, req.body.delivery_date])
        creationResult.insertId ? res.send({created:true }) : res.send({created:false})
    }  
    }   
    catch(c){
      console.log(c)
      res.send({data: false, catch:true})
    }
});


//ORDER LIST BY A SPECIFIC DATE

app.get('/orders/list', async (req, res) => {
   
    try{
       const ordersFetchQuery = "select * from orders where date = ? order by date desc"
       const ordersResult = await query(ordersFetchQuery, [req.body.date])
       ordersResult.length ? res.send({data: true, ordersResult}) : res.send({data: false,ordersResult:[]})
    }   
    catch(c){
       console.log(c)
       res.send({data: false, catch:true})
    }
});

// UPDATE DELIVERY DATE OF AN ORDER

app.post('/orders/update', async (req, res) => {

    try{
       const updateDeliveryDateQuery = "update orders set delivery_date = ? where order_id = ? order by date desc"
       const updateDeliveryDateResult= await query(updateDeliveryDateQuery,[req.body.delivery_date, req.body.order_id])
       updateDeliveryDateResult.affectedRows ? res.send({deliveryDateUpdated:true}) : res.send({deliveryDateUpdated:false})
    }   
    catch(c){
       console.log(c)
       res.send({data: false, catch:true})
    }
});

// SEARCH AN ORDER BY SPECIFIC ORDER ID

app.post('/orders/search', async (req, res) => {
   
    try{
       const orderFetchQuery = "select * from orders where order_id = ?"
       const orderResult= await query(orderFetchQuery,[req.body.order_id])
       orderResult.length ? res.send({data: true, orderResult}) : res.send({data: false,orderResult:[]})
    }   
    catch(c){
      console.log(c)
      res.send({data: false, catch:true})
    }
});

// DELETE AN ORDER BY SPECIFIC ORDER ID


app.post('/orders/delete', async (req, res) => {
   
    try{
       const orderDeletQuery = "delete from orders where order_id = ?"
       const deleteResult= await query(orderDeletQuery,[req.body.order_id])
       deleteResult.length ? res.send({deleted:true}) : res.send({deleted:false})
    }   
    catch(c){
      console.log(c)
      res.send({data: false, catch:true})
    }
});



app.listen(8000,()=>{
      console.log(`Server is listening at port number`,8000);
  });
