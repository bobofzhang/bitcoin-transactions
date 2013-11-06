if (Meteor.isClient) {
  var colors = d3.scale.category20b();
  
  Deps.autorun(function () {
    Socket.initialize();
  });

  Template.header.lastPrice = function () {
    return Session.get("lastPrice") || '$210.00';
  };

  Template.header.lastTransaction = function () {
    return Session.get("lastTransaction") || '0';
  };

  Template.svg.combo = function () {
    return Session.get("combo") || '0';
  };

  Template.svg.points = function () {
    return Session.get("points") || '0';
  };

  Template.svg.rendered = function() {
    $('body').on('keydown', function(e) {
      if (e.keyCode == 0 || e.keyCode == 32) { // space
        e.preventDefault();

        _.each(_.reject(d3.selectAll('circle')[0], function(circle) { return circle.style.opacity == 0; }), function(circle) { 
          var wav = '/sounds/explode' + _.sample([1, 2, 3]) + '.wav';
          var s = new buzz.sound(wav);
          s.play();

          for (var k = 0; k < 50; k++) {
            var cx = parseInt($(circle).attr('cx'), 10);
            var cy = parseInt($(circle).attr('cy'), 10);

            var randomX = (Math.floor(Random.fraction()*200)-100) + cx;
            var randomY = (Math.floor(Random.fraction()*200)-100) + cy;

            d3.select("#bubbles")
              .append('circle')
              .attr("cx", $(circle).attr('cx'))
              .attr("cy", $(circle).attr('cy'))
              .attr("r", 2)
              .style("stroke", colors(Random.fraction()))
              .style("fill", colors(Random.fraction()))
              .transition()
              .duration(800)
              .ease(Math.sqrt)
              .attr("cx", randomX)
              .attr("cy", randomY)
              .style("stroke-opacity", 1e-6)
              .style("fill-opacity",1e-6)
              .remove() 

            d3.select(circle).transition().duration(250).style("opacity", 0).remove();
          }
        });
      }
    });
  }

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
