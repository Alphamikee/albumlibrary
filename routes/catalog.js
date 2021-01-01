var express = require('express');
var router = express.Router();

// Require controller modules.
var album_controller = require('../controllers/albumController');
var artist_controller = require('../controllers/artistController');
var genre_controller = require('../controllers/genreController');
var album_instance_controller = require('../controllers/albuminstanceController');

// GET catalog home page.
router.get('/', album_controller.index);

// GET request for creating a album. NOTE This must come before routes that display album (uses id).
router.get('/album/create', album_controller.album_create_get);

// POST request for creating album.
router.post('/album/create', album_controller.album_create_post);

// GET request to delete album.
router.get('/album/:id/delete', album_controller.album_delete_get);

// POST request to delete album.
router.post('/album/:id/delete', album_controller.album_delete_post);

// GET request to update album.
router.get('/album/:id/update', album_controller.album_update_get);

// POST request to update album.
router.post('/album/:id/update', album_controller.album_update_post);

// GET request for one album.
router.get('/album/:id', album_controller.album_detail);

// GET request for list of all album items.
router.get('/albums', album_controller.album_list);

/// artist ROUTES ///

// GET request for creating artist. NOTE This must come before route for id (i.e. display artist).
router.get('/artist/create', artist_controller.artist_create_get);

// POST request for creating artist.
router.post('/artist/create', artist_controller.artist_create_post);

// GET request to delete artist.
router.get('/artist/:id/delete', artist_controller.artist_delete_get);

// POST request to delete artist.
router.post('/artist/:id/delete', artist_controller.artist_delete_post);

// GET request to update artist.
router.get('/artist/:id/update', artist_controller.artist_update_get);

// POST request to update artist.
router.post('/artist/:id/update', artist_controller.artist_update_post);

// GET request for one artist.
router.get('/artist/:id', artist_controller.artist_detail);

// GET request for list of all artists.
router.get('/artists', artist_controller.artist_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/genre/create', genre_controller.genre_create_get);

//POST request for creating Genre.
router.post('/genre/create', genre_controller.genre_create_post);

// GET request to delete Genre.
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST request to delete Genre.
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// GET request to update Genre.
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST request to update Genre.
router.post('/genre/:id/update', genre_controller.genre_update_post);

// GET request for one Genre.
router.get('/genre/:id', genre_controller.genre_detail);

// GET request for list of all Genre.
router.get('/genres', genre_controller.genre_list);

/// albumINSTANCE ROUTES ///

// GET request for creating a albumInstance. NOTE This must come before route that displays albumInstance (uses id).
router.get('/albuminstance/create', album_instance_controller.albuminstance_create_get);

// POST request for creating albumInstance.
router.post('/albuminstance/create', album_instance_controller.albuminstance_create_post);

// GET request to delete albumInstance.
router.get('/albuminstance/:id/delete', album_instance_controller.albuminstance_delete_get);

// POST request to delete albumInstance.
router.post('/albuminstance/:id/delete', album_instance_controller.albuminstance_delete_post);

// GET request to update albumInstance.
router.get('/albuminstance/:id/update', album_instance_controller.albuminstance_update_get);

// POST request to update albumInstance.
router.post('/albuminstance/:id/update', album_instance_controller.albuminstance_update_post);

// GET request for one albumInstance.
router.get('/albuminstance/:id', album_instance_controller.albuminstance_detail);

// GET request for list of all albumInstance.
router.get('/albuminstances', album_instance_controller.albuminstance_list);

module.exports = router;