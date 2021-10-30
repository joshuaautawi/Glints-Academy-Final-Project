const {OrderDetail,Order,UserReview } = require('../models')

async function createOrderDetail(detail){
    const result = await OrderDetail.create({
        order_id : detail.order_id,
        bus_schedule_id : detail.bus_schedule_id,
        departure_date : detail.departure_date,
        return_date : detail.return_date   
    })
    return result
}

async function showAllOrderDetailWithReview(req,res){
    const detail = await OrderDetail.findAll({
        include : [
            {
                model : Order,
                where : {
                    user_id : req.user.id
                }
            },
            {
            model : UserReview,
            }
        ]
    })
    
    return res.status(200).json({status :"success" , data : detail})
}



module.exports = {createOrderDetail,showAllOrderDetailWithReview}