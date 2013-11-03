if (Meteor.isClient) {
  Deps.autorun(function () {
    var websocket = new WebSocket('ws://websocket.mtgox.com');
    websocket.onopen = function () {
      websocket.send('{"op":"mtgox.subscribe","type":"ticker"}');    
    };

    websocket.onmessage = function (e) {
      var derp = JSON.parse(e.data);
      if (derp.ticker) {
        Session.set("lastPrice", derp.ticker.last.display);
      }
    };
  });

  Template.header.price = function () {
    return Session.get("lastPrice") || '$210.00';
  };

  Template.header.events({
    'click input' : function () {
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
