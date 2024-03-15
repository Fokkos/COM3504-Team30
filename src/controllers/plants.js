const log = require('debug')('app:db');
// Import the plants model
const PlantModel = require('../models/plants');

// Function to create new plants
exports.create = (plantData) => {
  // Create a new plant model
  const plant = new PlantModel({
    author: plantData.author,
    name: plantData.name,
    description: plantData.description,
    dateTimeSeen: plantData.dateTimeSeen,
    size: plantData.size,
    sunExposure: plantData.sunExposure,
    colour: plantData.colour,
    longitude: plantData.longitude,
    latitude: plantData.latitude,
    image: plantData.image,
    hasFlowers: plantData.hasFlowers,
    hasLeaves: plantData.hasLeaves,
    hasFruit: plantData.hasFruit,
    hasSeeds: plantData.hasSeeds,
  });

  // Save the new plant to the database and handle success or failure
  return plant
    .save()
    .then(() => {
      log(plant);

      // return plant data as a JSON string
      return JSON.stringify(plant);
    })
    .catch((error) => {
      log(error);

      // return null in case of an error
      return null;
    });
};

// Function to get all plants
exports.getPlants = (filter) => PlantModel.find(filter)
  .then((plants) => {
    plants.forEach((p) => {
      const dt = new Date(p.dateTimeSeen.toString());
      let day = dt.getDate().toString(); // Days are 1-indexed
      day = day > 9 ? day : `0${day}`;

      let month = (dt.getMonth() + 1).toString(); // Months are 0-indexed (consistency!)
      month = month > 9 ? month : `0${month}`;

      const year = dt.getFullYear();

      let hour = dt.getHours().toString();
      hour = hour > 9 ? hour : `0${hour}`;

      let min = dt.getMinutes().toString();
      min = min > 9 ? min : `0${min}`;

      const tz = dt.getTimezoneOffset();

      p.spottedString = `${hour}:${min} on ${day}/${month}/${year} (UTC+${tz}), in Sheffield `;

      p.emoji = '🇬🇧';
    });

    return plants;
  })
  .catch((error) => {
    log(error);

    // return null in case of an error
    return null;
  });