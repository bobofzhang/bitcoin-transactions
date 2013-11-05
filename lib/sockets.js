if (Meteor.isClient) {
  Socket = {
    initialize: function () {
      this.ticker();
      this.transactions();
    },
    
    ticker: function () {
      var websocket = new WebSocket('ws://websocket.mtgox.com');
      websocket.onopen = function () {
        websocket.send('{"op":"mtgox.subscribe","type":"ticker"}');    
      };

      websocket.onmessage = function (e) {
        var data = JSON.parse(e.data);
        if (data.ticker) {
          Session.set("lastPrice", data.ticker.last.display);
        }
      };
    },

    transactions: function () {
      var websocket = new WebSocket('ws://ws.blockchain.info/inv');
      websocket.onopen = function () {
        websocket.send('{"op":"unconfirmed_sub"}');    
      };

      websocket.onmessage = function (e) {
        _.each($('circle'), function (circle) {
          if (circle.style.opacity == 0) {
            $(circle).remove();
          }
        });

        var data = JSON.parse(e.data);
        if (data.x) {
          var total = _.reduce(data.x.out, function (sum, num) { return sum + num.value; }, 0) / 100000000;
          Session.set("lastTransaction", total);
          
          d3.select("#bubbles").append('circle')
            .attr('cx', randomPosition('x'))
            .attr('cy', randomPosition('y'))
            .attr('r', radius(total))
            .attr("fill", function(d, t) { return randomColor(); })
            .transition()
            .duration(5000)
            .style("opacity", 0);
        }

        var points = parseInt((Session.get("points") || 0) + $('circle').length * (total * 1000), 10);

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

        d3.select(".combo").text("combo " + $('circle').length);

        if ($('circle').length > (Session.get("high") || 0)) {
          var high = $('circle').length;
          d3.select(".high").text("high " + high);          
          Session.set("high", high);
        }

        Session.set("combo", $('circle').length);
        Session.set("points", points);
      };
    }
  }

  function randomPosition (axis) {
    var border = 50;

    if (axis == 'x')
      return Random.fraction() * (screen.width - (border * 2)) + border;
    else
      return Random.fraction() * (screen.height - (border * 2)) + border;
  }

  function radius (total) {
    return (Math.log(total + 1) * 3) + 25 + total;
  }

  function randomColor() {
    var colors = ['#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', 
        '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', '#e7cb94', '#843c39', 
        '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'];
    
    return _.shuffle(colors)[0]; 
  }
}
