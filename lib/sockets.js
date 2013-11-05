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
        var data = JSON.parse(e.data);
        if (data.x) {
          var total = _.reduce(data.x.out, function (sum, num) { return sum + num.value; }, 0) / 100000000,
            randomX = randomPosition('x'),
            randomY = randomPosition('y'),
            length = $('circle').length,
            radius = calcRadius(total),
            color = randomColor();

          Session.set("lastTransaction", total);
          
          d3.select("#bubbles").append('circle')
            .attr('cx', randomX)
            .attr('cy', randomY)
            .attr('r', radius)
            .attr("fill", color)
            .transition()
            .duration(5000)
            .style("opacity", 0)
            .remove();

          d3.select("#bubbles").append('text')
            .attr('x', randomX - 5)
            .attr('y', randomY - 5)
            .style('font-family', 'Impact')
            .style('font-size', '16px')
            .style('opacity', 0.8)
            .attr("fill", shadeColor(color))
            .text("x" + length)
            .transition()
            .duration(3000)
            .attr('y', randomY - 100)
            .style("opacity", 0)
            .remove();
        }

        var points = parseInt((Session.get("points") || 0) + length * (total * 1000), 10);

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

        d3.select(".combo").text("combo " + length);

        if (length > (Session.get("high") || 0)) {
          d3.select(".high").text("high " + length);          
          Session.set("high", length);
        }

        var wav = '/sounds/' + (length % 15) + '.wav';
        var s = new buzz.sound(wav);
        s.play();

        Session.set("combo", length);
        Session.set("points", points);
      };
    }
  }

  function randomPosition (axis) {
    var border = 50;

    if (axis == 'x')
      return Random.fraction() * ($(window).width() - (border * 2)) + border;
    else
      return Random.fraction() * ($(window).height() - (border * 2)) + border;
  }

  function calcRadius (total) {
    return (Math.log(total + 1) * 3) + 25 + total;
  }

  function randomColor() {
    var colors = ['#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', 
        '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', '#e7cb94', '#843c39', 
        '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'];
    
    return _.shuffle(colors)[0]; 
  }

  // function shadeColor(color) {
  //   var colors = ['#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', 
  //       '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', '#e7cb94', '#843c39', 
  //       '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'],
  //     newColors = ['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', 
  //       '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', 
  //       '#9e9ac8', '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9']

  //   var index = colors.indexOf(color);

  //   return newColors[index];
  // }

  function shadeColor(color) {
    color = color.replace("#", '');
    var num = parseInt(color,16),
    amt = Math.round(2.55 * 20),
    R = (num >> 16) + amt,
    B = (num >> 8 & 0x00FF) + amt,
    G = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
  }
}
