if (Meteor.isClient) {
  var colors = d3.scale.category20b();
  
  Deps.autorun(function () {
    Socket.initialize();
  });

  Template.header.lastPrice = function () {
    return Session.get("lastPrice") || '$0';
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
    $('body').on('keydown touchstart', function(e) {
      if (e.touches || e.keyCode == 0 || e.keyCode == 32) {
        e.preventDefault();

        _.each(_.reject(d3.selectAll('circle')[0], function(circle) { 
          return circle.style.opacity == 0 || circle.getAttribute('class') == 'removed'; 
        }), function(circle) {
          var wav = '/sounds/explode' + _.sample([1, 2, 3]) + '.wav';
          var s = new buzz.sound(wav);
          s.play();

          var particles = parseInt($(circle).attr('r'), 10);

          var cx = parseInt($(circle).attr('cx'), 10);
          var cy = parseInt($(circle).attr('cy'), 10);

          for (var k = 0; k < particles; k++) {
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

            d3.select(circle).attr('class', 'removed').transition().duration(250).style("opacity", 0).remove();
          }
          
          var bonus = particles * 1000 * Session.get("combo");
          
          d3.select("#bubbles").append('text')
            .attr('x', cx - 25)
            .attr('y', cy - 25)
            .style('font-family', 'Impact')
            .style('font-size', '18px')
            .style('opacity', 0.8)
            .attr("fill", "steelblue")
            .text("+" + bonus)
            .transition()
            .duration(3000)
            .attr('y', cy - 200)
            .style("opacity", 0)
            .remove();

          var points = parseInt((Session.get("points") || 0) + bonus, 10);
          Session.set("points", points);

          d3.select('.points')
            .text($('.points').text())
            .transition()
            .duration(3000)
            .ease('linear')
            .tween("text", function() {
              var i = d3.interpolate(this.textContent, points);
              return function(t) {
                this.textContent = "points " + Math.round(i(t));
              };
            });
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
