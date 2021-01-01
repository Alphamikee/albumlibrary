#! /usr/bin/env node

console.log('This script populates some test Albums, Artists, genres and Albuminstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Album = require('./models/album')
var Artist = require('./models/artist')
var Genre = require('./models/genre')
var AlbumInstance = require('./models/albuminstance')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Artists = []
var genres = []
var Albums = []
var Albuminstances = []

function ArtistCreate(first_name, family_name, nick_name, cb) {
  Artistdetail = {first_name:first_name , family_name: family_name , nick_name : nick_name}  
 
  var artist = new Artist(Artistdetail);
       
  artist.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Artist: ' + artist);
    Artists.push(artist)
    cb(null, artist)
  }  );
}

function genreCreate(name, cb) {
  var genre = new Genre({ name: name });
       
  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres.push(genre)
    cb(null, genre);
  }   );
}

function AlbumCreate(title, description, isbn, Artist, genre, cb) {
  Albumdetail = { 
    title: title,
    description: description,
    artist: Artist,
    isbn: isbn,
    genre: genre
  }
  if (genre != false) Albumdetail.genre = genre
    
  var album = new Album(Albumdetail);    
  album.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Album: ' + album);
    Albums.push(album)
    cb(null, album)
  }  );
}


function AlbumInstanceCreate(Album, imprint, due_back, status, cb) {
  Albuminstancedetail = { 
    Album: Album,
    imprint: imprint
  }    
  if (due_back != false) Albuminstancedetail.due_back = due_back
  if (status != false) Albuminstancedetail.status = status
    
  var albuminstance = new AlbumInstance(Albuminstancedetail);    
  albuminstance.save(function (err) {
    if (err) {
      console.log(err.message)
      console.log('ERROR CREATING AlbumInstance: ' + albuminstance);
      cb(err, null)
      return
    }
    console.log('New AlbumInstance: ' + albuminstance);
    Albuminstances.push(albuminstance)
    cb(null, Album)
  }  );
}


function createGenreArtists(cb) {
    async.series([
        function(callback) {
          ArtistCreate('Marshall', 'Bruce', 'Eminem' ,callback);
        },
        function(callback) {
          ArtistCreate('Calvin', 'Cordozar', 'Snoop Dogg', callback);
        },
        function(callback) {
          ArtistCreate('Nathan', 'John' , 'NF', callback);
        },
        function(callback) {
          ArtistCreate('Robert', 'Bryson',  'Logic', callback);
        },
        function(callback) {
          ArtistCreate('Aubrey', 'Drake',  'Drake',callback);
        },
        function(callback) {
          genreCreate("old School", callback);
        },
        function(callback) {
          genreCreate("New shcool", callback);
        },
        function(callback) {
          genreCreate("Hip-Hop Trap", callback);
        },
        ],
        // optional callback
        cb );
}


function createAlbums(cb) {
  console.log('hi')
    async.parallel([
        function(callback) {
          console.log('hiii1')
          AlbumCreate('Kamikaze', `Kamikaze (stylized as KAMIKAZƎ) is the tenth studio album by American rapper Eminem, released on August 31, 2018 by Aftermath Entertainment, Interscope Records`, '9781473211896', Artists[0], [genres[0]], callback);
        },
        function(callback) {
          console.log('hiii2')
          AlbumCreate("Doggystyle", 'Doggystyle is the debut studio album by American rapper Snoop Dogg (who was at the time, Snoop Doggy Dogg). It was released on November 23, 1993,', '9788401352836', Artists[1], [genres[1]], callback);
        },
        function(callback) {
          console.log('hiii3')
          AlbumCreate("Dark lane demo" , 'Dark Lane Demo Tapes is a mixtape by Canadian rapper Drake' , '9780756411336', Artists[4], [genres[1]], callback);
        },
        ],
        // optional callback
        cb);
}


function createAlbumInstances(cb) {
    async.parallel([
        function(callback) {
          AlbumInstanceCreate(Albums[0], 'London Gollancz, 2014.', false, 'Available', callback)
        },
        function(callback) {
          AlbumInstanceCreate(Albums[1], ' Gollancz, 2011.', false, 'Loaned', callback)
        },
        function(callback) {
          AlbumInstanceCreate(Albums[2], ' Gollancz, 2015.', false, false, callback)
        },
        function(callback) {
          AlbumInstanceCreate(Albums[2], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          AlbumInstanceCreate(Albums[2], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          AlbumInstanceCreate(Albums[2], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          AlbumInstanceCreate(Albums[0], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Available', callback)
        },
        function(callback) {
          AlbumInstanceCreate(Albums[1], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Maintenance', callback)
        },
        function(callback) {
          AlbumInstanceCreate(Albums[2], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Loaned', callback)
        },
        function(callback) {
          AlbumInstanceCreate(Albums[0], 'Imprint XXX2', false, false, callback)
        },
        function(callback) {
          AlbumInstanceCreate(Albums[1], 'Imprint XXX3', false, false, callback)
        }
        ],
        // Optional callback
        );
}



async.series([
    createGenreArtists,
    createAlbums,
    createAlbumInstances
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('AlbumInstances: '+Albuminstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});