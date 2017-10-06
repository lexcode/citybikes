var citybikes = angular.module('citybikes', []);

// environment
citybikes.factory('environment', function(){
  return {

    // development environment
    'citybikes-lexcode.wedeploy.io': {
      app: 'citybikes-lexcode.wedeploy.io',
      api: 'https://api.citybik.es/v2/'
    },

    // sample environment
    // 'domain.com': {
    //   app: 'http://domain.com/',
    //   api: 'http://api.citybik.es/v2/'
    // }
  }
});

// urls
citybikes.service('url', function(environment){

  // baseurl
  this.app = function(path){
    return environment[window.location.hostname].app + path;
  };

  // web service
  this.api = function(path){
    return environment[window.location.hostname].api + path;
  };

});

// controllers
citybikes.controller('map', function($scope, $http, url){

  var map = $scope.map = {};

  $http({
    method: 'GET',
    url: url.api('networks'),
    params: {
      fields: 'id,location'
    }
  })
  .then(function(response){
    map.locations = response.data.networks;
  });

  map.filter = function(name){
    for(var i in map.locations){
      var item = map.locations[i];
      if(item.location.city == name){
        return item;
        break;
      }
    }
    return false;
  };

  map.station = function(id){
    for(var i in map.stations){
      var item = map.stations[i];
      if(item.id == id){
        return item;
        break;
      }
    }
    return {};
  };

  map.search = function(){
    var item = map.filter(map.location);

    if(item){
      centerMap(item.location.latitude, item.location.longitude);

      $http({
        method: 'GET',
        url: url.api('networks/'+item.id)
      })
      .then(function(response){
        map.stations = response.data.network.stations;
        map.pointer = map.station(map.stations[0].id);
        map.formatdate = moment( map.pointer.timestamp ).fromNow();

        for(var i in map.stations){
          var item = map.stations[i];

          var marker = new google.maps.Marker({
            position: {
              lat: item.latitude,
              lng: item.longitude
            },
            animation: google.maps.Animation.DROP,
            map: gMaps,
            id: item.id
          });

          marker.addListener('click', function(){
            map.pointer = map.station(this.id);
            $scope.$apply();
          });
        }
      });
    }
  }
});

// API Google
function initialize(){

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(posicao){
      centerMap(posicao.coords.latitude, posicao.coords.longitude);
    });
  }

  var pos = new google.maps.LatLng(40.779502, -73.967857);

  gMaps = new google.maps.Map(document.getElementById('map'),{
    zoom: 15,
    center: pos,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
}

function centerMap(lat,lng){
  gMaps.setCenter(new google.maps.LatLng(lat,lng));
}
