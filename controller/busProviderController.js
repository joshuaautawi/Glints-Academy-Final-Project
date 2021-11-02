const { BusProvider } = require('../models')


async function createBusProvider (req,res){
  try{
    const {
      provider_name,
      city,
      email,
      phone,
      website,
      facebook,
      instagram,
      twitter,
      photo,
      banking_name,
      banking_account,
      tax_id,
      ktp_owner,
      owner_picture,
    } = req.body
    const { id } = req.user
    const [result , created] = await BusProvider.findOrCreate({
      where : {
        user_id : id
      },
      defaults: {
        provider_name,
        city,
        email,
        phone,
        website,
        facebook,
        instagram,
        twitter,
        photo,
        banking_name,
        banking_account,
        tax_id,
        ktp_owner,
        owner_picture,
        user_id : id
      }});

    if(!created) return res.status(200).json({status:"failed" , message : "Bus Provider already been created" , pastData : result})
    return res.status(200).json({status : "success", message : result})
  }catch(e){
    return res.status(400).json({status :"failed", message : "error has been occured ", error : e})
  }
   
}


async function findBusProviderId(user){
    const result = await BusProvider.findAll({
        where : {
            user_id : user.dataValues.id
        }
    })
    return result[0].id
}

async function readBusProvider(req,res){
    try {
        const readbusProvider = await BusProvider.findAll();
        res.status(200).json({
          status: "success",
          massage: "success retrived data",
          data: readbusProvider,
        });
      } catch (error) {
        res.status(500).json({
          status: "failed",
          massage: "internal server error",
        });
      }
}

async function updateBusProvider(req,res){
    const body = req.body;
    
    try {
        if(body.user_id) return res.status(400).json({status :"failed" , message : "user_id cannot be changed !"})
        const editbusProvider = await BusProvider.update(
            { ...body },
            {
            where: {
                user_id : req.user.id
            },
            }
        );
        if (!editbusProvider[0]) {
            res.status(400).json({
            status: "failed",
            massage: "unable to update",
            });
        }
        res.status(200).json({
            status: "success",
            massage: "updated success",
        });
    } catch (error) {
          res.status(500).json({
            status: "failed",
            massage: "internal server error",
          });
    }
}

module.exports = {
  createBusProvider,
  findBusProviderId,
  updateBusProvider,
  readBusProvider
}