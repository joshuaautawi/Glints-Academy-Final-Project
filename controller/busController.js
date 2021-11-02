const { Bus } = require('../models')

async function createBus(bus){
    const result = await Bus.create({
        bus_name: bus.bus_name,
        air_conditioner: bus.air_conditioner,
        toilet: bus.toilet,
        free_meal: bus.free_meal,
        charger: bus.charger,
        comfortable_seat: bus.comfortable_seat,
        wifi: bus.wifi,
        photo_collection: bus.photo_collection,
        seat: bus.seat,
        published: bus.published
      });
      return result
}





module.exports = {createBus}

