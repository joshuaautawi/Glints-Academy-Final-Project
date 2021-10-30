const { Order ,sequelize ,BusSchedule ,Passenger, Bus, Shuttle, BusProvider,UserReview,OrderDetail} = require('../models')
const { Op ,Transaction} = require("sequelize");
const { generateTicket } = require('../helper/ticketGenerator');
const moment = require('moment');
const {availableSeat} = require('../helper/seat')
const {orderDetail} = require('../helper/orderDetail')
const {createOrderDetail}= require('./orderDetailController')


async function createOrder(req,res){
    try{
        const {
            departure_date, return_date,fullname,email,age,phone,departure_seat,return_seat,passenger,order_type,departure_bus_id,return_bus_id
        } = req.body
        const { id } = req.user
        if(order_type != "RoundTrip" && order_type != "OneWay") return res.status(400).json({status:"failed" , message : "Order type must be 'RoundTrip' or 'OneWay' !"})
        if(fullname.length != passenger ||
            email.length != passenger ||
            age.length != passenger ||
            phone.length != passenger ||
            departure_seat.length != passenger ) return res.status(400).json({status :"failed",message: "Please check your input !" })
        if(order_type == "RoundTrip" && return_seat.length != passenger)return res.status(400).json({status :"failed",message: "Please check your input !" })
        if( return_date == departure_date) return res.status(400).json({status :"failed" , message :"departure date and return date cannot be the same !"})
        for(let i = 0 ; i < passenger;i++){
            if(order_type == "OneWay"){
                let departure_seats = await availableSeat(departure_date,departure_bus_id)
                if(departure_seats[departure_seat[i]-1] != 0) return res.status(400).json({status : "failed" , message : "seat already booked !"})
            }
           
            if(order_type == "RoundTrip"){
                let d_seats = await availableSeat(departure_date,departure_bus_id)
                if(d_seats[departure_seat[i]-1] != 0) return res.status(400).json({status : "failed" , message : "seat already booked !"})
                let return_seats = await availableSeat(return_date,return_bus_id)
                if(return_seats[return_seat[i]-1] != 0) return res.status(400).json({status : "failed" , message : "seat already booked !"})
            }
           
        }
        
        const result = await sequelize.transaction({isolationLevel : Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED},async (t) => {
            const order = await Order.create({
                date : new Date(),
                departure_date : moment(departure_date).format("YYYY-MM-DD"),
                return_date : order_type == "RoundTrip"? moment(return_date).format("YYYY-MM-DD") : null,
                ticket : generateTicket(),
                order_status : "pending",
                user_id : id,
                total_passenger : passenger,
                order_type : order_type
            },{transaction:t})
        const bulkData =[]
        for(let i = 0 ; i < passenger;i++){
            if(order_type == "OneWay"){
                bulkData.push(
                    {
                        fullname : fullname[i],
                        email : email[i],
                        age : age[i],
                        phone : phone[i],
                        departure_seat: departure_seat[i],
                        order_id : order.id
                    }
                )
            }
            else{
                bulkData.push(
                    {
                        fullname : fullname[i],
                        email : email[i],
                        age : age[i],
                        phone : phone[i],
                        departure_seat: departure_seat[i],
                        return_seat : return_seat[i],
                        order_id : order.id
                    }
                )
            }
        }
           
            
        await Passenger.bulkCreate(bulkData,{transaction:t})
        if(order_type == "OneWay"){
            createOrderDetail({order_id : order.id,bus_schedule_id : departure_bus_id,departure_date : departure_date})
        }
        else if(order_type == "RoundTrip"){
            createOrderDetail({order_id : order.id,bus_schedule_id : departure_bus_id,departure_date : departure_date},{transaction:t})
            createOrderDetail({order_id : order.id,bus_schedule_id : return_bus_id, return_date : return_date},{transaction:t})
        }
        return res.status(200).json({status: "success" , message : "order has been created !",orderId : order.id})
    }) 
    }catch(e){
        return res.status(400).json({status : "failed" , message: "order cannot been created", error : e})
    }
    
}

async function showOrderDetail(req,res){
    try{
        const {order_id} = req.body
        const data = await orderDetail(order_id)
        return res.status(200).json({status : "success", data : data})
    }catch(e){
        return res.status(400).json({status : "failed", message : "Error has occured" , error : e })
    }
}    

async function seatArrangement(req,res){
    try{
        const{ date,bus_schedule_id} = req.body
        const seat = await availableSeat(date,bus_schedule_id)
        
        return res.status(200).json({status : "success", data : seat})
    }catch(e){
        return res.status(400).json({status:"failed",message : "error has been occured !", error : e})
    }
    
}

async function showUserReviewByOrder(req,res){
    try{
        const list = await Order.findAll({
            where : {
                [Op.and] : [ {user_id : req.user.id} ],
                [Op.or] : [{order_status : "success"} ,{order_status:"pending"} ]
            },
            include : [
                {
                    model : OrderDetail,
                    include : [
                        {
                            model : BusSchedule,
                            include : [Bus,BusProvider]
                        },
                    ]
                },
                {model : UserReview}
            ]
        })
        if(list.length == 0 )throw new Error
        const result = []
        list.forEach(e=>{
            const dep_sch= e.OrderDetails[0].BusSchedule
            result.push ({
                order_id : e.id,
                bus_name : dep_sch.Bus.bus_name,
                order_detail : e.OrderDetails[0].id,
                ShuttleDestination : {from :dep_sch.departure_city, To : dep_sch.destination_city},
                Review:e.UserReview
            })
            if(e.order_type == "RoundTrip"){
                const ret_sch = e.OrderDetails[1].BusSchedule
                result.push ({
                    order_id : e.id,
                    bus_name : ret_sch.Bus.bus_name,
                    order_detail : {return : e.OrderDetails[1].id},
                    ShuttleDestination : {from :ret_sch.departure_city, To : ret_sch.destination_city},
                    Review:e.UserReview
                })
            } 
        })

        return res.status(200).json({status : "success", data : result})
    }catch(e){
        return res.status(400).json({status:"failed",message : "error has been occured !", error : e})
    }
}

async function showTicket(req,res){
    let result =[]
    const order = await Order.findAll({
        where :{
            user_id : req.user.id,
            order_status: "pending"
        },
        include: [
            {
                model: OrderDetail,
                include : [BusSchedule]
            }
        ]
    })
   
    for(let i = 0 ;i<order.length;i++){
        const departure_ticket_status = order[i].departure_date <=new Date()
        if(order[i].order_type == "RoundTrip"){
            const return_ticket_status = order[i].return_date <= new Date()
            
            result.push( {
                order_id : order[i].id,
                ticket : order[i].ticket,
                departure_date : order[i].departure_date,
                departure_status_ticket :  departure_ticket_status,
                departure_destination : `${order[i].OrderDetails[0].BusSchedule.departure_city} - ${order[i].OrderDetails[0].BusSchedule.destination_city}`,
                return_date : order[i].return_date,
                return_destination : ""+ order[i].OrderDetails[1].BusSchedule.departure_city + " - "+order[i].OrderDetails[1].BusSchedule.destination_city,
                return_ticket_status : return_ticket_status
    
            })
        }else if( order[i].order_type == "OneWay"){
            result.push({
                order_id : order[i].id,
                ticket : order[i].ticket,
                departure_date : order[i].departure_date,
                departure_destination : ""+ order[i].OrderDetail[0].BusSchedule.departure_city + " - "+order[i].OrderDetail[0].BusSchedule.departure_city,
                departure_status_ticket : departure_ticket_status
            })
        }
    }
    return res.status(200).json({status : "success" , data : result})
    
}


async function showTicketDetail (req,res){
    try{
        const { order_id} = req.body
        const order = await Order.findOne({
            where :{
                id : order_id,
                order_status : "pending",
                user_id : req.user.id
            },
            include : [
                {
                    model : OrderDetail,
                    include: [{
                        model : BusSchedule,
                        include : [Bus,BusProvider]
                    }]
                }
            ]
        })
        const passenger = await Passenger.findAll({
            where : {
                order_id : order_id
            }
        })
        if(order.length == 0 )return res.status(200).json({status : "success", message :"ticket is not found"  , data : []})
        const dept=  []
            const e = order
            const elem = order.OrderDetails[1].BusSchedule
            const ticket_status =  e.departure_date >= new Date()
            dept.push({
            order_date :moment(e.date).format('MMMM Do YYYY, h:mm:ss a'),
            order_id : e.id,
            total_passenger : e.total_passenger,
            ticket_number : e.ticket,
            departure : {
                bus_name : elem.Bus.bus_name,
                departure_from: [elem.departure_time,elem.departure_city , elem.departure_shuttle],
                arrival_to : [elem.arrival_time, elem.destination_city, elem.arrival_shuttle],
                ticket_status : ticket_status ,
                facilities : {
                    AC : elem.Bus.air_conditioner,
                    toilet : elem.Bus.toilet,
                    free_meal : elem.Bus.free_meal,
                    charger : elem.Bus.charger,
                    comfortable_seat : elem.Bus.comforable_seat,
                    wifi : elem.Bus.wifi
                },
                passenger_detail : passenger
            }
           
        })
        let r= []
     
        if(order.order_type == "RoundTrip"){

            const e = order
            const el = order.OrderDetails[1].BusSchedule
            const ticket_status =  e.departure_date >= new Date()
            r.push({
            order_date :moment(e.date).format('MMMM Do YYYY, h:mm:ss a'),
            order_id : e.id,
            total_passenger : e.total_passenger,
            ticket_number : e.ticket,
            departure : {
                bus_name : el.Bus.bus_name,
                departure_from: [el.departure_time,el.departure_city , el.departure_shuttle],
                arrival_to : [el.arrival_time, el.destination_city, el.arrival_shuttle],
                ticket_status : ticket_status ,
                facilities : {
                    AC : el.Bus.air_conditioner,
                    toilet : el.Bus.toilet,
                    free_meal : el.Bus.free_meal,
                    charger : el.Bus.charger,
                    comfortable_seat : el.Bus.comforable_seat,
                    wifi : el.Bus.wifi
                },
                passenger_detail : passenger
            }
           
        })
        }
        return res.status(200).json({status : "success" , departure : dept , return : r})
    }catch(e){
        return res.status(400).json({status : "failed" , error : e , message : "Error has occured !"})
    }
   
}


module.exports ={ createOrder ,seatArrangement ,showUserReviewByOrder,showOrderDetail,availableSeat,showTicketDetail,showTicket}