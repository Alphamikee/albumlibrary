var Artist = require('../models/artist');
const async = require('async');
let Album = require('../models/album')
const { body,validationResult } = require('express-validator');
// Display list of all artists.
exports.artist_list = function(req, res) {
    Artist.find()
    .sort([['nick_name', 'ascending']])
    .exec(function (err, list_artists) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('artist_list', { title: 'artist List', artist_list: list_artists });
    });
};

// Display detail page for a specific artist.
exports.artist_detail = function(req, res) {
    async.parallel({
        artist: function(callback) {
            Artist.findById(req.params.id)
              .exec(callback)
        },
        artists_albums: function(callback) {
          Album.find({ 'artist': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.artist==null) { // No results.
            var err = new Error('artist not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('artist_detail', { title: 'artist Detail', artist: results.artist, artist_albums: results.artists_albums } );
    });
};
exports.artist_create_get = function(req, res, next) {
    res.render('artist_form', { title: 'Create artist'});
};
// Display artist create form on GET.
exports.artist_create_post = [

    // Validate and sanitise fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('nick_name').trim().isLength({min: 1}).escape().withMessage('nick name must be specified.')
        .isAlphanumeric().withMessage('Nick name has non-alphanumeric characters.'),
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('artist_form', { title: 'Create artist', artist: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an artist object with escaped and trimmed data.
            var artist = new Artist(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    nick_name: req.body.nick_name
                });
            artist.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new artist record.
                res.redirect(artist.url);
            });
        }
    }
];

// Display artist delete form on GET.
exports.artist_delete_get = function(req, res, next) {

    async.parallel({
        artist: function(callback) {
            Artist.findById(req.params.id).exec(callback)
        },
        artists_albums: function(callback) {
          Album.find({ 'artist': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.artist==null) { // No results.
            res.redirect('/catalog/artists');
        }
        // Successful, so render.
        res.render('artist_delete', { title: 'Delete artist', artist: results.artist, artist_albums: results.artists_albums } );
    });

};

// Handle artist delete on POST.
exports.artist_delete_post = function(req, res, next) {

    async.parallel({
        artist: function(callback) {
          Artist.findById(req.body.artistid).exec(callback)
        },
        artists_albums: function(callback) {
          Album.find({ 'artist': req.body.artistid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.artists_albums.length > 0) {
            // artist has albums. Render in same way as for GET route.
            res.render('artist_delete', { title: 'Delete artist', artist: results.artist, artist_albums: results.artists_albums } );
            return;
        }
        else {
            // artist has no albums. Delete object and redirect to the list of artists.
            Artist.findByIdAndRemove(req.body.artistid, function deleteartist(err) {
                if (err) { return next(err); }
                // Success - go to artist list
                res.redirect('/catalog/artists')
            })
        }
    });
};

// Display artist update form on GET.
exports.artist_update_get = function(req, res, next) {

    // Get book, artists and genres for form.
    async.parallel({
        artist: function(callback) {
            Artist.find(callback);
        }
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.artist==null) { // No results.
                var err = new Error('artist not found');
                err.status = 404;
                return next(err);
            }
            res.render('artist_form', { title: 'Update artist', artist: results.artist});
        });

};

// Handle artist update on POST.
exports.artist_update_post = [
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('nick_name').trim().isLength({min: 1}).escape().withMessage('nick name must be specified.')
    .isAlphanumeric().withMessage('Nick name has non-alphanumeric characters.'),
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var artist = new Artist(
          { 
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            nick_name: req.body.nick_name,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all artists and genres for form.
            async.parallel({
                artists: function(callback) {
                    artist.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('artist_form', { title: 'Update artist',artist: results.artist, errors: errors.array() });
            });
        }
        else {
            // Data from form is valid. Update the record.
            Artist.findByIdAndUpdate(req.params.id, artist, {}, function (err,thebook) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(thebook.url);
                });
        }
    }
];