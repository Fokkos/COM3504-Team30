const express = require('express');
const multer = require('multer');
const log = require('debug')('app:db');
const renderLayout = require('../helpers/layout-renderer');

const router = express.Router();
const plants = require('../controllers/plants');

/* IMAGE CODE (move into seperate route eventually) */

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/img/uploads');
  },
  filename(req, file, cb) {
    const original = file.originalname;
    const fileExtension = original.split('.');
    const filename = `${Date.now()}.${fileExtension[fileExtension.length - 1]}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

/* GET home page. */
router.get('/', (req, res) => {
  const result = plants.getAll();
  result.then(JSON.parse).then((allPlants) => {
    allPlants.forEach((p) => {
      const dt = new Date(p.dateTimeSeen);
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

    renderLayout(res, 'index', { title: 'All Plants', plants: allPlants, scripts: ['filters'] });
  });
});

router.get('/page-2', (req, res) => {
  renderLayout(res, 'page2');
});

router.get('/page-3', (req, res) => {
  renderLayout(res, 'page3');
});

router.post('/create-plant', upload.single('image'), (req, res) => {
  const plantData = req.body;
  const filepath = req.file.path.replace(/\\/g, '/');

  let hasFlowers;
  let hasLeaves;
  let hasFruit;
  let hasSeeds;

  // deal with checkboxes, as they have no value if not checked
  if (plantData.hasFlowers === 'true') {
    hasFlowers = true;
  } else {
    hasFlowers = false;
  }
  if (plantData.hasLeaves === 'true') {
    hasLeaves = true;
  } else {
    hasLeaves = false;
  }

  if (plantData.hasFruit === 'true') {
    hasFruit = true;
  } else {
    hasFruit = false;
  }

  if (plantData.hasSeeds === 'true') {
    hasSeeds = true;
  } else {
    hasSeeds = false;
  }

  const plant = {
    author: 'placeholder', // replace with user when implemented
    name: plantData.name,
    description: plantData.description,
    dateTimeSeen: new Date(plantData.dateTimeSeen),
    size: parseFloat(plantData.size),
    sunExposure: plantData.sunExposure,
    colour: plantData.colour,
    longitude: plantData.longitude,
    latitude: plantData.latitude,
    image: filepath,
    hasFlowers,
    hasLeaves,
    hasFruit,
    hasSeeds,
  };

  const result = plants.create(plant);
  log(result);

  res.redirect('/');
});

module.exports = router;
