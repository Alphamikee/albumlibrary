var AlbumInstance = require('../models/albuminstance');
const { body,validationResult } = require('express-validator');
var Album = require('../models/album');
const async = require('async');
// Display list of all albumInstances.
exports.albuminstance_list = function(req, res , next) {
    AlbumInstance.find().exec((err,list_albumInstance )=> {
        if(err){return next(err)}
        console.log(list_albumInstance)
        res.render('albuminstance_list' , {title : 'Album INstance List' , albuminstance_list: list_albumInstance})
    })
};

// Display detail page for a specific albumInstance.
exports.albuminstance_detail = function(req, res) {
    AlbumInstance.findById(req.params.id)
    .populate('Album')
    .exec(function (err, albuminstance) {
      if (err) { return next(err); }
      if (albuminstance==null) { // No results.
          var err = new Error('album copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      console.log(albuminstance)
      res.render('albuminstance_detail', { title: 'Copy: '+albuminstance.Album.title, albuminstance:  albuminstance});
    })};

// Display albumInstance create form on GET.
exports.albuminstance_create_get = function(req, res) {
    Album.find({},'title')
    .exec(function (err, albums) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('albuminstance_form', {title: 'Create albumInstance', album_list: albums});
    })
};

// Handle albumInstance create on POST.
exports.albuminstance_create_post = [

    // Validate and sanitise fields.
    body('album', 'album must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a albumInstance object with escaped and trimmed data.
        var albuminstance = new AlbumInstance(
          { Album: req.body.album,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Album.find({},'title')
                .exec(function (err, albums) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('albuminstance_form', { title: 'Create albumInstance', album_list: albums, selected_album: albuminstance.album._id , errors: errors.array(), albuminstance: albuminstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            albuminstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(albuminstance.url);
                });
        }
    }
];

// Display albumInstance delete form on GET.
exports.albuminstance_delete_get = function (req, res, next) {

    async.parallel({
        albuminstance: function (callback) {
            AlbumInstance.findById(req.params.id).exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.albuminstance == null) { // No results.
            res.redirect('/catalog/albuminstance');
        }
        // Successful, so render.
        res.render('albuminstance_delete', { title: 'Delete albuminstance', albuminstance: results.albuminstance});
    });

};

// Handle albumInstance delete on POST.
exports.albuminstance_delete_post = function (req, res, next) {
    console.log(req.body.albuminstanceid)
    async.parallel({
        albuminstance: function (callback) {
            AlbumInstance.findById(req.body.albuminstanceid).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        else {
            // Author has no albums. Delete object and redirect to the list of authors.
            AlbumInstance.findByIdAndRemove(req.body.albuminstanceid, function deletealbumInstance(err) {
                if (err) { return next(err); }
                // Success - go to author list.
                res.redirect('/catalog/albuminstances')
            })
        }
    });

};

// Display albumInstance update form on GET.
exports.albuminstance_update_get = function(req, res , next) {
    async.parallel({
      albuminstance: function(callback) {
          AlbumInstance.find( {'_id' : req.params.id} , callback);
      },
        album_list : function (callback){
        Album.find(callback)
        }
      }, function(err, results) {
          if (err) { return next(err); }
          if (results.albuminstance==null) { // No results.
              var err = new Error('Genre not found');
              err.status = 404;
              return next(err);
          }
          console.log(results.albuminstance[0])
          res.render('albuminstance_form', { title: 'Update albuminstance', albuminstance: results.albuminstance[0] , album_list : results.album_list , selected_album : results.albuminstance.album_id});
      });
  };

// Handle albuminstance update on POST.
exports.albuminstance_update_post = [
    body('album', 'album must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),
    (req, res, next) => {
          // Extract the validation errors from a request.
          const errors = validationResult(req);
  
          // Create a album object with escaped/trimmed data and old id.
          const albuminstance = new AlbumInstance(
            { album : req.body.album ,
                imprint : req.body.imprint ,
                status : req.body.status,
                due_back : req.body.due_back,
              _id : req.params.id
            });
  
          if (!errors.isEmpty()) {
              // There are errors. Render form again with sanitized values/error messages.
  
              // Get all authors and genres for form.
              async.parallel({
                  albuminstance: function(callback) {
                      AlbumInstance.find({'_id' : req.body.id} , callback);
                  },
                  album_list : function (callback){
                    Album.find({} , 'title').exec(err , callback)
                  }
              }, function(err, results) {
                  if (err) { return next(err); }
                  res.render('albuminstance_form', { title: 'Update albuminstance' , album_list : results.album_list,albuminstance: results.albuminstance, errors: errors.array() });
              });
          }
          else {
              // Data from form is valid. Update the record.
              AlbumInstance.findByIdAndUpdate(req.params.id, albuminstance, {}, function (err,theGenre) {
                  if (err) { 
                    return next(err); }
                     // Successful - redirect to album detail page.
                     res.redirect(theGenre.url);
                  });
          }
      }
]