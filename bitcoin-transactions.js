if (Meteor.isClient) {
  Deps.autorun(function () {
    Socket.initialize();
  });

  Template.header.lastPrice = function () {
    return Session.get("lastPrice") || '$210.00';
  };

  Template.header.lastTransaction = function () {
    return Session.get("lastTransaction") || '0';
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
