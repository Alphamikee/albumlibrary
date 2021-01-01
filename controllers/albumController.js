var Album = require('../models/album');
const async = require('async');
let Artist = require('../models/artist')
let AlbumInstance = require('../models/albuminstance')
let Genre = require('../models/genre')
const { body,validationResult } = require("express-validator");
exports.index = function(req, res) {

    async.parallel({
        album_count: function(callback) {
            Album.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        album_instance_count: function(callback) {
            AlbumInstance.countDocuments({}, callback);
        },
        album_instance_available_count: function(callback) {
            AlbumInstance.countDocuments({status:'Available'}, callback);
        },
        artist_count: function(callback) {
            Artist.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        }
    }, function(err, results) {
        console.log(results.album_count)
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};

// Display list of all albums.
exports.album_list = function(req, res) {
    Album.find({}, 'title artist')
    .populate('artist')
    .exec(function (err, list_albums) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('album_list', { title: 'album List', album_list: list_albums });
    });
};

// Display detail page for a specific album.
exports.album_detail = function(req, res) {
    async.parallel({
        album: function(callback) {

            Album.findById(req.params.id)
              .populate('artist')
              .populate('genre')
              .exec(callback);
        },
        album_instance: function(callback) {

          AlbumInstance.find({ 'album': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.album==null) { // No results.
            var err = new Error('album not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('album_detail', { title: results.album.title, album: results.album, album_instances: results.album_instance } );
    });};

// Display album create form on GET.
exports.album_create_get = function(req, res) {
        // Get all artistss and genres, which we can use for adding to our album.
        async.parallel({
            artists: function(callback) {
                Artist.find(callback);
            },
            genres: function(callback) {
                Genre.find(callback);
            },
        }, function(err, results) {
            if (err) { return next(err); }
            res.render('album_form', { title: 'Create album', artists: results.artists, genres: results.genres });
        });
};

// Handle album create on POST.
exports.album_create_post = [
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre ==='undefined')
            req.body.genre = [];
            else
            req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('artist', 'artist must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'description ').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a album object with escaped and trimmed data.
        var album = new Album(
          { title: req.body.title,
            artist: req.body.artist,
            description: req.body.description,
            isbn: req.body.isbn,
            genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all artists and genres for form.
            async.parallel({
                artists: function(callback) {
                    Artist.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (album.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('album_form', { title: 'Create album',artists:results.artists, genres:results.genres, album: album, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save album.
            album.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new album record.
                   res.redirect(album.url);
                });
        }
    }
];

// Display album delete form on GET.
exports.album_delete_get = function(req, res, next) {

    async.parallel({
        album: function(callback) {
            Album.findById(req.params.id).exec(callback)
        },
        album_Instance: function(callback) {
          AlbumInstance.find({ 'album': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.album==null) { // No results.
            res.redirect('/catalog/albums');
        }
        // Successful, so render.
        console.log('hiii')
        console.log(results.album_Instance)
        res.render('album_delete', { title: 'Delete album', album: results.album, album_instance: results.album_Instance } );
    });

};

// Handle album delete on POST.
exports.album_delete_post = function(req, res, next) {

    async.parallel({
        album: function(callback) {
          Album.findById(req.body.albumid).exec(callback)
        },
        album_Instance: function(callback) {
            AlbumInstance.find({ 'album': req.params.id }).exec(callback)
          },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.album_Instance.length > 0) {
            // artist has albums. Render in same way as for GET route.
            res.render('album_delete', { title: 'Delete albumInstance', album: results.album, album_instance: results.album_instance } );
            return;
        }
        else {
            // artist has no albums. Delete object and redirect to the list of artists.
            Album.findByIdAndRemove(req.body.albumid, function deleteartist(err) {
                if (err) { return next(err); }
                // Success - go to artist list
                res.redirect('/catalog/albums')
            })
        }
    });
};

// Display album update form on GET.
exports.album_update_get = function(req, res, next) {

    // Get album, artists and genres for form.
    async.parallel({
        album: function(callback) {
            Album.findById(req.params.id).populate('artist').populate('genre').exec(callback);
        },
        artists: function(callback) {
            Artist.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.album==null) { // No results.
                var err = new Error('album not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var album_g_iter = 0; album_g_iter < results.album.genre.length; album_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()===results.album.genre[album_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            res.render('album_form', { title: 'Update album', artists: results.artists, genres: results.genres, album: results.album });
        });

};

// Handle album update on POST.
exports.album_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('artist', 'artist must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a album object with escaped/trimmed data and old id.
        var album = new Album(
          { title: req.body.title,
            artist: req.body.artist,
            description: req.body.description,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all artists and genres for form.
            async.parallel({
                artists: function(callback) {
                    Artist.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (album.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('album_form', { title: 'Update album',artists: results.artists, genres: results.genres, album: album, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Album.findByIdAndUpdate(req.params.id, album, {}, function (err,thealbum) {
                if (err) { return next(err); }
                   // Successful - redirect to album detail page.
                   res.redirect(thealbum.url);
                });
        }
    }
];