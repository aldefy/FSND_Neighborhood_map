var map;

var Location = function(data) {
    var self = this;
    self.id = data.id;
    self.title = data.title;
    self.location = data.location;
    self.visible = ko.observable(true);
    self.cuisine = data.Cuisine;

        var largeInfowindow = new google.maps.InfoWindow();
        // Create a marker per location, and put into markers array.
        this.marker = new google.maps.Marker({
            position: data.location,
            title: data.title,
            animation: google.maps.Animation.DROP,
            id: data.id,
            cuisine: data.Cuisine,
            map: map
        });

        // Create an onclick event to open an infowindow at each marker.
        this.marker.addListener('click', function() {
            var self = this;
            self.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                self.setAnimation(null);
            }, 700);
            populateInfoWindow(this, largeInfowindow);
        });
};

// This function populates the infowindow when the marker is clicked.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        var zomatoApiKey = "84028ef7f3b21aaad7e0f2f8908e2a87";
        var zomatoUrl = 'https://developers.zomato.com/api/v2.1/restaurant?res_id='+
             marker.id + '&apikey=' + zomatoApiKey;
        $.getJSON(zomatoUrl).done(function(data) {
          var results = data;
          var Url = results.url || 'No Url Provided';
          var street = results.location.address || 'Address Unavailable';
          var city = results.location.city || '';
          var cuisines = results.cuisines || 'Unavailable';
          var img = results.thumb || '';
          var rating = results.user_rating.aggregate_rating || 'Unavailable';

            infowindow.marker = marker;
            infowindow.close();
            infowindow.setContent( '<div align="center">' +
            '<img src="' + img + '" alt="Image">' +'<div><b>'
            + marker.title + "</b></div>" + '<div><a href="' +
            Url +'">' + Url + "</a></div>" + '<div>' + street +
            "</div>" + '<div>' + city + "</div>" +
            '<div>' + "<b>" + "Cuisines:   " + "</b>" +
            cuisines + "</div>" + '<div>' + "<b>" + "Rating: "
            + "</b>" + rating + "</div>" + "</div>");
            infowindow.open(map, marker);
            // The Marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });

         }).fail(function() {
    alert("Unable to load Zomato data. Sorry For the inconvinience try again later.");
  });
    }
}

function mapLoadError() {
  alert("Google Maps is Unable to load please try again later.");
}

var appViewModel = function() {
    var self = this;

    var locations =  ko.observableArray([
      {
        id: 52819,
        title: 'Little Paramount Restaurants',
        location: {lat: 12.9926642000, lng:77.5910211000},
        Cuisine: 'Chinese, North Indian'
      },
      {
        id: 60313,
        title: 'Maiyas Restaurants Pvt Ltd',
        location: {lat: 12.9182373000, lng: 77.5558970000},
        Cuisine: 'South Indian, Fast Food'
      },
      {
        id: 18280615,
        title: 'Swathi Deluxe',
        location: {lat: 12.9378495126, lng: 77.6990404353},
        Cuisine: 'North Indian, Indian'
      }
    ]);

    self.search = ko.observable('');
    self.searching = ko.observable('');
    self.markers = ko.observableArray();
    //Create a new map
    var myLocality =
    {
        zoom: 12,
        center: {lat: 12.9724703, lng: 77.586047},
        mapTypeControl: false
    };

    map = new google.maps.Map(document.getElementById('map'), myLocality);


    for (var i = 0; i < locations().length; i++) {
        var restaurant = new Location(locations()[i]);
        self.markers.push(restaurant);
    }


    // Search Using Both Name and Cuisine

        self.searchboxes = ko.computed(function() {
        return ko.utils.arrayFilter(self.markers(), function(r) {
            var resName = self.search().toLowerCase();
            var cusName = self.searching().toLowerCase();
            var currentItemName = r.title.toLowerCase();
            var currentItemCuisine = r.cuisine.toLowerCase();
            if (resName && cusName) {
                if ((currentItemName.indexOf(resName) >= 0) && (currentItemCuisine.indexOf(cusName) >= 0)) {
                    r.visible(true);
                    if (r.marker) {
                        r.marker.setVisible(true);
                    }
                } else {
                    r.visible(false);
                    if (r.marker) {
                        r.marker.setVisible(false);
                    }
                }
            }

            if (resName && !cusName) {
                if (currentItemName.indexOf(resName) >= 0) {
                    r.visible(true);
                    if (r.marker) {
                        r.marker.setVisible(true);
                    }
                } else {
                    r.visible(false);
                    if (r.marker) {
                        r.marker.setVisible(false);
                    }
                }
            }

            if (cusName && !resName) {
                if (currentItemCuisine.indexOf(cusName) >= 0) {
                    r.visible(true);
                    if (r.marker) {
                        r.marker.setVisible(true);
                    }
                } else {
                    r.visible(false);
                    if (r.marker) {
                        r.marker.setVisible(false);
                    }
                }
            }

            if (!cusName && !resName) {
                r.visible(true);
                    if (r.marker) {
                        r.marker.setVisible(true);
                    }
            }
        });
    });

    self.infoPopup = function (locations) {
        google.maps.event.trigger(locations.marker, 'click');
    };

    self.reCenter = function() {
        map.setCenter(myLocality.center);
    };
};

function initMap() {
  ko.applyBindings(new appViewModel());
}
